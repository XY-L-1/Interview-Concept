import "server-only";
import { NextResponse } from "next/server";
import { configuredSiteOrigin } from "./config";
import { isSameOrigin, OwnerAccessError } from "./policy";

export const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  Vary: "Cookie",
  "Referrer-Policy": "no-referrer",
};

export function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: privateHeaders });
}

export function privateError(error: unknown) {
  const status = error instanceof OwnerAccessError ? error.status : 503;
  return privateJson({ error: status === 401 ? "unauthenticated" : status === 403 ? "forbidden" : "unavailable" }, status);
}

export function mutationOriginAllowed(request: Request): boolean {
  return isSameOrigin(request.headers.get("origin"), configuredSiteOrigin(request.url));
}
