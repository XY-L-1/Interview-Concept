import assert from "node:assert/strict";
import test from "node:test";
import { isSameOrigin, ownerFromVerifiedUser, safeReturnPath } from "../../src/modules/identity/policy";

const owner = { id: "owner-id", email: "owner@example.com", email_confirmed_at: "2026-10-20T00:00:00Z" };

test("only a confirmed verified owner record authorizes access", () => {
  assert.deepEqual(ownerFromVerifiedUser(owner, "OWNER@example.com"), { id: owner.id, email: owner.email });
  assert.equal(ownerFromVerifiedUser(null, owner.email), null);
  assert.equal(ownerFromVerifiedUser({ ...owner, email: "stranger@example.com" }, owner.email), null);
  assert.equal(ownerFromVerifiedUser({ ...owner, email_confirmed_at: null }, owner.email), null);
  assert.equal(ownerFromVerifiedUser(owner, ""), null);
  const misleadingMetadata = { ...owner, email: "stranger@example.com", user_metadata: { email: owner.email, role: "owner" } };
  assert.equal(ownerFromVerifiedUser(misleadingMetadata, owner.email), null);
});

test("mutations require the exact site origin", () => {
  assert.equal(isSameOrigin("https://interview.example", "https://interview.example/prepare"), true);
  for (const origin of [null, "null", "https://evil.example", "https://interview.example.evil.example", "http://interview.example", "https://interview.example:444", "https://interview.example/path"]) {
    assert.equal(isSameOrigin(origin, "https://interview.example"), false, String(origin));
  }
});

test("login return targets remain inside the preparation workspace", () => {
  assert.equal(safeReturnPath("/prepare/studio"), "/prepare/studio");
  assert.equal(safeReturnPath("/prepare"), "/prepare");
  for (const path of [null, "https://evil.example", "//evil.example", "/prepare\\evil", "/prepare\nLocation: bad", "/login", "/preparation"]) {
    assert.equal(safeReturnPath(path), "/prepare");
  }
});
