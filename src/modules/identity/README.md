# Identity and access

Owner-only Supabase email login and private document access. Public learning content does not require an account.

Server configuration: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `APP_OWNER_EMAIL`, and `APP_SITE_URL` (canonical origin, including the local development port when testing locally). Only the first two values may be public. No service-role key is used by the application.

`getOptionalOwner()` returns a fresh, confirmed, verified owner record or null. `requireOwner()` throws an `OwnerAccessError` for API callers; `requireOwnerPage()` redirects to `/login`. Neither JWT user metadata nor client-provided identity authorizes access.

The login form sends email only to the configured owner and uses `shouldCreateUser: false`. Provision the owner account through the supported Supabase Auth flow before using it. Register `/auth/callback` in Supabase redirect URLs for the default magic link. `/auth/confirm` accepts `token_hash` with `type=email` for a custom email template; typed email OTP is also supported if the email includes a code. `POST /auth/signout` requires the site origin.

Apply the migration, then provision exactly three owner rows (`profile`, `studio`, `progress`) through an administrator connection. The browser cannot insert or delete documents. Authenticated users can only select their own seeded rows and update the content column under RLS. A database trigger advances the document version.

`GET /api/private/documents/[key]` returns `{ key, content, version, updatedAt }`. `PUT` accepts `{ content, expectedVersion }`, validates the corresponding schema, and atomically updates the matching version. Conflicts return 409 with `currentVersion`; missing rows return 404. Mutations require the canonical site origin, and all private responses disable caching. `GET /api/private/session` returns the verified owner or an authorization error.

Local tests cover authorization boundaries, origin checks, redirect constraints, document validation, and bounded JSON parsing. Auth delivery, cookies, remote RLS, and cross-device persistence require integration checks against the configured project.
