import { privateError, privateJson } from "@/modules/identity/http";
import { requireOwner } from "@/modules/identity/server";

export async function GET() {
  try { return privateJson({ user: (await requireOwner()).user }); }
  catch (error) { return privateError(error); }
}
