import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authConfig } from "./config";
import { OwnerAccessError, ownerFromVerifiedUser, type OwnerUser } from "./policy";

export async function createAuthClient() {
  const config = authConfig();
  const cookieStore = await cookies();
  return createServerClient(config.url, config.key, {
    cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies; the request proxy refreshes them.
        }
      },
    },
  });
}

export async function requireOwner() {
  const config = authConfig();
  const supabase = await createAuthClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new OwnerAccessError(401);
  const owner = ownerFromVerifiedUser(user, config.ownerEmail);
  if (!owner) throw new OwnerAccessError(403);
  return { user: owner, supabase };
}

export async function getOptionalOwner(): Promise<OwnerUser | null> {
  try { return (await requireOwner()).user; } catch { return null; }
}

export async function requireOwnerPage(): Promise<OwnerUser> {
  try { return (await requireOwner()).user; } catch { redirect("/login"); }
}
