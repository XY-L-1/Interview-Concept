import { isDocumentKey, readLimitedJson, validateDocumentUpdate } from "@/modules/identity/documents";
import { mutationOriginAllowed, privateError, privateJson } from "@/modules/identity/http";
import { requireOwner } from "@/modules/identity/server";

type Context = { params: Promise<{ key: string }> };
type DocumentRow = { key: string; content: unknown; version: number; updated_at: string };

function responseDocument(row: DocumentRow) {
  return { key: row.key, content: row.content, version: row.version, updatedAt: row.updated_at };
}

export async function GET(_request: Request, context: Context) {
  try {
    const { user, supabase } = await requireOwner();
    const { key } = await context.params;
    if (!isDocumentKey(key)) return privateJson({ error: "not_found" }, 404);
    const { data, error } = await supabase.from("private_documents")
      .select("key,content,version,updated_at").eq("user_id", user.id).eq("key", key).maybeSingle();
    if (error) return privateJson({ error: "unavailable" }, 503);
    return data ? privateJson(responseDocument(data)) : privateJson({ error: "not_found" }, 404);
  } catch (error) { return privateError(error); }
}

export async function PUT(request: Request, context: Context) {
  try {
    if (!mutationOriginAllowed(request)) return privateJson({ error: "forbidden" }, 403);
    const { user, supabase } = await requireOwner();
    const { key } = await context.params;
    if (!isDocumentKey(key)) return privateJson({ error: "not_found" }, 404);
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
      return privateJson({ error: "invalid_content_type" }, 415);
    }
    let input: unknown;
    try { input = await readLimitedJson(request); }
    catch { return privateJson({ error: "invalid_document" }, 400); }
    if (!validateDocumentUpdate(key, input)) return privateJson({ error: "invalid_document" }, 400);
    const { data, error } = await supabase.from("private_documents")
      .update({ content: input.content }).eq("user_id", user.id).eq("key", key)
      .eq("version", input.expectedVersion).select("key,content,version,updated_at").maybeSingle();
    if (error) return privateJson({ error: "unavailable" }, 503);
    if (data) return privateJson(responseDocument(data));
    const current = await supabase.from("private_documents").select("version")
      .eq("user_id", user.id).eq("key", key).maybeSingle();
    if (current.error) return privateJson({ error: "unavailable" }, 503);
    return current.data
      ? privateJson({ error: "conflict", currentVersion: current.data.version }, 409)
      : privateJson({ error: "not_found" }, 404);
  } catch (error) { return privateError(error); }
}
