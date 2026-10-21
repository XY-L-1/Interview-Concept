import { isRecord, type ProgressDocument } from "./model";

function equal(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((entry, index) => equal(entry, b[index]));
  if (isRecord(a) && isRecord(b)) {
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every((key) => Object.hasOwn(b, key) && equal(a[key], b[key]));
  }
  return false;
}

export function mergeProgress(base: ProgressDocument, local: ProgressDocument, remote: ProgressDocument, prefer: "local" | "remote" = "local") {
  const conflicts: string[] = [];
  function merge(before: unknown, ours: unknown, theirs: unknown, path: string): unknown {
    if (equal(ours, before)) return theirs;
    if (equal(theirs, before) || equal(ours, theirs)) return ours;
    if (isRecord(ours) && isRecord(theirs) && (isRecord(before) || before === undefined)) {
      const original = isRecord(before) ? before : {};
      const keys = new Set([...Object.keys(original), ...Object.keys(ours), ...Object.keys(theirs)]);
      return Object.fromEntries([...keys].flatMap((key) => {
        const value = merge(original[key], ours[key], theirs[key], path ? `${path}.${key}` : key);
        return value === undefined ? [] : [[key, value]];
      }));
    }
    // Practice sessions are append-only. Preserve independent new sessions.
    if (path.endsWith(".sessions") && Array.isArray(before) && Array.isArray(ours) && Array.isArray(theirs)
      && before.every((entry, index) => equal(entry, ours[index]) && equal(entry, theirs[index]))) {
      const combined = [...theirs];
      for (const entry of ours.slice(before.length)) if (!combined.some((item) => equal(item, entry))) combined.push(entry);
      return combined;
    }
    if (path.endsWith(".updatedAt") && typeof ours === "string" && typeof theirs === "string"
      && Number.isFinite(Date.parse(ours)) && Number.isFinite(Date.parse(theirs))) {
      return Date.parse(ours) >= Date.parse(theirs) ? ours : theirs;
    }
    conflicts.push(path);
    return prefer === "local" ? ours : theirs;
  }
  return { document: merge(base, local, remote, "") as ProgressDocument, conflicts };
}

export const progressEqual = equal;
