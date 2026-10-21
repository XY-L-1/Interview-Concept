import type { NextRequest } from "next/server";
import { refreshAuth } from "./modules/identity/proxy";

export async function proxy(request: NextRequest) {
  return refreshAuth(request);
}

export const config = {
  matcher: ["/", "/review", "/courses/:path*", "/prepare/:path*", "/login", "/auth/:path*", "/api/private/:path*"],
};
