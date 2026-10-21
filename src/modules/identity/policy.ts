export type OwnerUser = { id: string; email: string };

export class OwnerAccessError extends Error {
  constructor(public readonly status: 401 | 403 | 503) {
    super(status === 503 ? "Authentication is unavailable." : "Owner access required.");
  }
}

export function ownerFromVerifiedUser(
  user: { id: string; email?: string; email_confirmed_at?: string | null } | null,
  ownerEmail: string,
): OwnerUser | null {
  if (!user?.id || !user.email || !user.email_confirmed_at || !ownerEmail.trim()) return null;
  return user.email.toLowerCase() === ownerEmail.trim().toLowerCase()
    ? { id: user.id, email: user.email }
    : null;
}

export function safeReturnPath(value: string | null | undefined): string {
  if (!value || /[\\\r\n]/.test(value)) return "/prepare";
  return value === "/prepare" || value.startsWith("/prepare/") ? value : "/prepare";
}

export function isSameOrigin(origin: string | null, expectedOrigin: string): boolean {
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    return parsed.origin === new URL(expectedOrigin).origin && parsed.href === `${parsed.origin}/`;
  } catch {
    return false;
  }
}
