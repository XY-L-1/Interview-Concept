import "server-only";
import { NextResponse } from "next/server";
import { authConfig, configuredSiteOrigin } from "./config";
import { ownerFromVerifiedUser, safeReturnPath } from "./policy";
import { createAuthClient } from "./server";
import { privateHeaders } from "./http";

export async function completeLogin(request: Request, method: "code" | "token") {
  const requestUrl = new URL(request.url);
  let origin: string;
  try { origin = configuredSiteOrigin(request.url); }
  catch { return new NextResponse("Login is unavailable.", { status: 503, headers: privateHeaders }); }
  const failure = () => NextResponse.redirect(new URL("/login?error=invalid-link", origin), { headers: privateHeaders });
  try {
    const supabase = await createAuthClient();
    const token = requestUrl.searchParams.get(method === "code" ? "code" : "token_hash");
    if (!token || token.length > 4096) return failure();
    if (method === "token" && requestUrl.searchParams.get("type") !== "email") return failure();
    const result = method === "code"
      ? await supabase.auth.exchangeCodeForSession(token)
      : await supabase.auth.verifyOtp({ token_hash: token, type: "email" });
    if (result.error) return failure();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !ownerFromVerifiedUser(user, authConfig().ownerEmail)) {
      await supabase.auth.signOut({ scope: "local" });
      return failure();
    }
    return NextResponse.redirect(new URL(safeReturnPath(requestUrl.searchParams.get("next")), origin), { headers: privateHeaders });
  } catch { return failure(); }
}
