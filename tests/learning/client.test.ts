import assert from "node:assert/strict";
import test from "node:test";
import { DocumentConflict, loadPrivateDocument, savePrivateDocument } from "../../src/modules/learning/client";

test("private reads bypass caches and writes carry the expected version", async (context) => {
  const original = globalThis.fetch;
  context.after(() => { globalThis.fetch = original; });
  const calls: { input: unknown; init?: RequestInit }[] = [];
  globalThis.fetch = async (input, init) => {
    calls.push({ input, init });
    return Response.json({ key: "progress", content: { synthetic: true }, version: 3, updatedAt: "2026-10-20T10:00:00Z" });
  };
  await loadPrivateDocument("progress");
  await savePrivateDocument("progress", { synthetic: true }, 2);
  assert.equal(calls[0].input, "/api/private/documents/progress");
  assert.equal(calls[0].init?.cache, "no-store");
  assert.equal(calls[0].init?.credentials, "same-origin");
  assert.deepEqual(JSON.parse(calls[1].init?.body as string), { content: { synthetic: true }, expectedVersion: 2 });
});

test("version conflicts and missing authorization do not report a successful save", async (context) => {
  const original = globalThis.fetch;
  context.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => new Response("", { status: 409 });
  await assert.rejects(savePrivateDocument("progress", {}, 1), DocumentConflict);
  globalThis.fetch = async () => new Response("", { status: 401 });
  await assert.rejects(loadPrivateDocument("progress"), /授权账号登录/);
});
