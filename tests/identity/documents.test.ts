import assert from "node:assert/strict";
import test from "node:test";
import { createEmptyWorkspace } from "../../src/modules/preparation/model";
import { emptyProgress } from "../../src/modules/learning/model";
import { isDocumentKey, MAX_DOCUMENT_BYTES, readLimitedJson, validateDocument, validateDocumentUpdate } from "../../src/modules/identity/documents";

test("document updates accept only the three schemas and a positive expected version", () => {
  assert.equal(isDocumentKey("profile"), true);
  assert.equal(isDocumentKey("studio"), true);
  assert.equal(isDocumentKey("progress"), true);
  assert.equal(isDocumentKey("other"), false);
  assert.equal(validateDocumentUpdate("profile", { content: createEmptyWorkspace(), expectedVersion: 1 }), true);
  assert.equal(validateDocumentUpdate("progress", { content: emptyProgress(), expectedVersion: 3 }), true);
  for (const expectedVersion of [0, -1, 1.5, "1", null, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(validateDocumentUpdate("progress", { content: emptyProgress(), expectedVersion }), false);
  }
  assert.equal(validateDocumentUpdate("profile", { content: emptyProgress(), expectedVersion: 1 }), false);
  assert.equal(validateDocumentUpdate("progress", { content: emptyProgress(), expectedVersion: 1, user_id: "other" }), false);
  assert.equal(validateDocument("studio", { schemaVersion: 1, behavior: {}, foundations: {} }), false);
});

test("profile evidence and studio readiness are validated before storage", () => {
  const profile = createEmptyWorkspace();
  const invalid = { ...profile, profile: { ...profile.profile, facts: [{ id: "a", text: "private", tags: [], provenance: "guessed", contribution: "personal", source: "" }] } };
  assert.equal(validateDocument("profile", invalid), false);
  assert.equal(validateDocument("progress", { ...emptyProgress(), studio: { "unknown-storage-key": {} } }), false);
});

test("JSON request reader enforces byte limits and rejects malformed input", async () => {
  const request = (body: string) => new Request("https://interview.example/api/private/documents/progress", { method: "PUT", body });
  assert.deepEqual(await readLimitedJson(request('{"ok":true}')), { ok: true });
  await assert.rejects(readLimitedJson(request("{")));
  await assert.rejects(readLimitedJson(request(JSON.stringify({ text: "中".repeat(Math.ceil(MAX_DOCUMENT_BYTES / 3)) }))));
});
