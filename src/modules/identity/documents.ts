import { validateWorkspace } from "../preparation/model";
import { parseStudioBundle } from "../preparation/studio-model";
import { validateProgressDocument } from "../learning/model";

export const DOCUMENT_KEYS = ["profile", "studio", "progress"] as const;
export type DocumentKey = (typeof DOCUMENT_KEYS)[number];
export const MAX_DOCUMENT_BYTES = 2_000_000;

export function isDocumentKey(key: string): key is DocumentKey {
  return DOCUMENT_KEYS.includes(key as DocumentKey);
}

export function validateDocument(key: DocumentKey, content: unknown): boolean {
  if (key === "profile") return validateWorkspace(content).ok;
  if (key === "progress") return validateProgressDocument(content);
  try { parseStudioBundle(JSON.stringify(content)); return true; } catch { return false; }
}

export function validateDocumentUpdate(key: DocumentKey, input: unknown): input is { content: unknown; expectedVersion: number } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const value = input as Record<string, unknown>;
  return Object.keys(value).every((field) => ["content", "expectedVersion"].includes(field))
    && Number.isSafeInteger(value.expectedVersion) && Number(value.expectedVersion) >= 1
    && validateDocument(key, value.content);
}

export async function readLimitedJson(request: Request): Promise<unknown> {
  if (!request.body) throw new Error("Missing body");
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let raw = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_DOCUMENT_BYTES) throw new Error("Body too large");
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
    return JSON.parse(raw);
  } finally { await reader.cancel(); }
}
