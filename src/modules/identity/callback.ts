import "server-only";
import { NextResponse } from "next/server";
import { authConfig, configuredSiteOrigin } from "./config";
import { ownerFromVerifiedUser, safeReturnPath } from "./policy";
import { createAuthClient } from "./server";
import { privateHeaders } from "./http";
import { classifyLoginFailure, type LoginFailureReason } from "./auth-errors";

export async function completeLogin(request: Request, method: "code" | "token") {
  const requestUrl = new URL(request.url);
  let origin: string;
  try { origin = configuredSiteOrigin(request.url); }
  catch { return new NextResponse("Login is unavailable.", { status: 503, headers: privateHeaders }); }
  const failure = (reason: LoginFailureReason) => {
    const destination = new URL("/login", origin);
    destination.searchParams.set("error", reason);
    return NextResponse.redirect(destination, { headers: privateHeaders });
  };
  try {
    if (requestUrl.searchParams.has("error") || requestUrl.searchParams.has("error_code")) {
      return failure(classifyLoginFailure({ code: requestUrl.searchParams.get("error_code") }));
    }
    const supabase = await createAuthClient();
    const token = requestUrl.searchParams.get(method === "code" ? "code" : "token_hash");
    if (!token) return failure(method === "code" ? "missing-code" : "invalid-link");
    if (token.length > 4096) return failure("invalid-link");
    if (method === "token" && requestUrl.searchParams.get("type") !== "email") return failure("invalid-link");
    const result = method === "code"
      ? await supabase.auth.exchangeCodeForSession(token)
      : await supabase.auth.verifyOtp({ token_hash: token, type: "email" });
    if (result.error) return failure(classifyLoginFailure(result.error));
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return failure("unavailable");
    if (!ownerFromVerifiedUser(user, authConfig().ownerEmail)) {
      await supabase.auth.signOut({ scope: "local" });
      return failure("access-denied");
    }
    return NextResponse.redirect(new URL(safeReturnPath(requestUrl.searchParams.get("next")), origin), { headers: privateHeaders });
  } catch (error) { return failure(classifyLoginFailure(error)); }
}
