import "server-only";
import { OwnerAccessError } from "./policy";

export function authConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const ownerEmail = process.env.APP_OWNER_EMAIL;
  if (!url || !key || !ownerEmail) throw new OwnerAccessError(503);
  return { url, key, ownerEmail };
}

export function configuredSiteOrigin(fallback?: string): string {
  const configured = process.env.APP_SITE_URL;
  if (configured) return new URL(configured).origin;
  if (process.env.NODE_ENV !== "production" && fallback) {
    const parsed = new URL(fallback);
    if (["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname)) return parsed.origin;
  }
  throw new OwnerAccessError(503);
}
