import assert from "node:assert/strict";
import test from "node:test";
import { emptyProgress, parseLearningProgress, validateProgressDocument, validateStudioProgress } from "../../src/modules/learning/model";
import { mergeProgress } from "../../src/modules/learning/merge";

const at = "2026-10-20T10:00:00.000Z";
const later = "2026-10-20T11:00:00.000Z";
const key = "simple-ai-behavior-progress-v1";

test("progress schema preserves explicit learning states and all legacy Studio sections", () => {
  const value = { schemaVersion: 1, questions: { one: { status: "review", updatedAt: at } }, studio: {
    [key]: { notes: { synthetic: "A private test note" }, sessions: [] },
    "simple-ai-foundations-progress-v1": { kind: "foundations-progress", schemaVersion: 1, questions: {} },
    "simple-ai-studio-navigation-v1": { section: "foundations" },
  } };
  assert.deepEqual(parseLearningProgress(value), value);
  assert.deepEqual(emptyProgress(), { schemaVersion: 1, questions: {}, studio: {} });
});

test("invalid statuses, unknown documents, unsafe keys and non-JSON values are rejected", () => {
  for (const value of [
    { ...emptyProgress(), schemaVersion: 2 },
    { ...emptyProgress(), publicProfile: true },
    { ...emptyProgress(), questions: { one: { status: "done", updatedAt: at } } },
    { ...emptyProgress(), questions: { one: { status: "learning", updatedAt: "invalid" } } },
    { ...emptyProgress(), questions: { one: { status: "learning", updatedAt: "2026-02-30T10:00:00.000Z" } } },
    { ...emptyProgress(), studio: { unknown: {} } },
    { ...emptyProgress(), studio: { [key]: { number: Infinity } } },
    { ...emptyProgress(), studio: JSON.parse('{"simple-ai-behavior-progress-v1":{"__proto__":{}}}') },
  ]) assert.equal(validateProgressDocument(value), false);
  assert.equal(validateStudioProgress({ [key]: [] }), false);
});

test("concurrent progress on different questions merges without wiping either", () => {
  const base = emptyProgress();
  const local = { ...base, questions: { one: { status: "learning" as const, updatedAt: at } } };
  const remote = { ...base, questions: { two: { status: "confident" as const, updatedAt: later } } };
  const merged = mergeProgress(base, local, remote);
  assert.deepEqual(merged.conflicts, []);
  assert.deepEqual(merged.document.questions, { ...local.questions, ...remote.questions });
  assert.deepEqual(base, emptyProgress());
});

test("same-question status conflicts stay explicit; newer timestamps alone do not conflict", () => {
  const base = { ...emptyProgress(), questions: { one: { status: "learning" as const, updatedAt: at } } };
  const local = { ...base, questions: { one: { status: "review" as const, updatedAt: later } } };
  const remote = { ...base, questions: { one: { status: "confident" as const, updatedAt: later } } };
  const merged = mergeProgress(base, local, remote);
  assert.deepEqual(merged.conflicts, ["questions.one.status"]);
  assert.equal(merged.document.questions.one.status, "review");
  assert.equal(mergeProgress(base, local, remote, "remote").document.questions.one.status, "confident");
});

test("independent Studio notes and new practice sessions survive concurrent saves", () => {
  const base = { ...emptyProgress(), studio: { [key]: { notes: { first: "original" }, sessions: [] } } };
  const local = { ...base, studio: { [key]: { notes: { first: "local edit" }, sessions: [{ at, qid: "synthetic-a" }] } } };
  const remote = { ...base, studio: { [key]: { notes: { first: "original", second: "remote note" }, sessions: [{ at: later, qid: "synthetic-b" }] } } };
  const result = mergeProgress(base, local, remote);
  assert.deepEqual(result.conflicts, []);
  assert.deepEqual(result.document.studio[key]?.notes, { first: "local edit", second: "remote note" });
  assert.equal((result.document.studio[key]?.sessions as unknown[]).length, 2);
});

test("choosing cloud for a same-note conflict preserves unrelated local work", () => {
  const base = { ...emptyProgress(), studio: { [key]: { notes: { same: "original" } } } };
  const local = { ...base, studio: { [key]: { notes: { same: "local", other: "keep this" } } } };
  const remote = { ...base, studio: { [key]: { notes: { same: "remote" } } } };
  const result = mergeProgress(base, local, remote, "remote");
  assert.deepEqual(result.conflicts, [`studio.${key}.notes.same`]);
  assert.deepEqual(result.document.studio[key]?.notes, { same: "remote", other: "keep this" });
});
