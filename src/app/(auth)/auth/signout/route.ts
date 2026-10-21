import { NextResponse } from "next/server";
import { configuredSiteOrigin } from "@/modules/identity/config";
import { mutationOriginAllowed, privateError, privateHeaders, privateJson } from "@/modules/identity/http";
import { createAuthClient } from "@/modules/identity/server";

export async function POST(request: Request) {
  try {
    if (!mutationOriginAllowed(request)) return privateJson({ error: "forbidden" }, 403);
    const supabase = await createAuthClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) return privateJson({ error: "unavailable" }, 503);
    return NextResponse.redirect(new URL("/login", configuredSiteOrigin(request.url)), { status: 303, headers: privateHeaders });
  } catch (error) { return privateError(error); }
}
