import assert from "node:assert/strict";
import test from "node:test";
import { buildPreparation } from "../../src/modules/preparation/answers";
import {
  createEmptyWorkspace,
  parseWorkspace,
  serializeWorkspace,
  validateWorkspace,
  type PreparationWorkspace,
} from "../../src/modules/preparation/model";

function fixture(): PreparationWorkspace {
  const workspace = createEmptyWorkspace();
  workspace.profile.displayName = "Test candidate";
  workspace.profile.facts = [
    { id: "java", text: "I implemented a Java API.", tags: ["java", "payments"], provenance: "user-confirmed", contribution: "personal", source: "Synthetic test fact" },
    { id: "ai", text: "I evaluated model responses.", tags: ["ai", "evaluation"], provenance: "code-evidence", contribution: "personal", source: "Synthetic code evidence" },
    { id: "unknown", text: "UNVERIFIED_PERSONAL_CLAIM", tags: ["java", "ai"], provenance: "needs-review", contribution: "personal", source: "Old unverified analysis" },
    { id: "team", text: "TEAM_ONLY_CLAIM", tags: ["java"], provenance: "user-confirmed", contribution: "team", source: "Team context" },
    { id: "context", text: "CONTEXT_ONLY_CLAIM", tags: [], provenance: "code-evidence", contribution: "context", source: "System description" },
  ];
  workspace.profile.stories = [{ id: "project", title: "Synthetic project", factIds: workspace.profile.facts.map((fact) => fact.id), reflection: "PRIVATE_REFLECTION_NOT_EXPERIENCE" }];
  return workspace;
}

test("JSON import and export preserve the complete versioned workspace", () => {
  const original = fixture();
  original.context = { company: "Example", roleTitle: "Backend", focus: "backend-platform", interviewDate: "2026-10-22", notes: "Clarify remote location" };
  const result = parseWorkspace(serializeWorkspace(original));
  assert.ok(result.ok);
  assert.deepEqual(result.value, original);
});

test("invalid JSON, unknown schemas, fields and enum values are rejected clearly", () => {
  assert.deepEqual(parseWorkspace("{"), { ok: false, errors: ["JSON 格式无效。请检查引号、逗号和括号。"] });
  for (const input of [
    { ...fixture(), schemaVersion: 2 },
    { ...fixture(), serverUpload: true },
    { ...fixture(), context: { ...fixture().context, focus: "unknown-role" } },
    { ...fixture(), profile: { ...fixture().profile, facts: [{ ...fixture().profile.facts[0], provenance: "assumed" }] } },
  ]) {
    const result = validateWorkspace(input);
    assert.equal(result.ok, false);
    if (!result.ok) assert.ok(result.errors.length);
  }
});

test("import rejects duplicate identities, missing story references, and invalid dates", () => {
  const duplicate = fixture();
  duplicate.profile.facts.push({ ...duplicate.profile.facts[0] });
  assert.equal(validateWorkspace(duplicate).ok, false);
  const missing = fixture();
  missing.profile.stories[0].factIds.push("missing");
  assert.equal(validateWorkspace(missing).ok, false);
  for (const interviewDate of ["2026-02-30", "10/22/2026", "not-a-date"]) {
    const workspace = fixture();
    workspace.context.interviewDate = interviewDate;
    assert.equal(validateWorkspace(workspace).ok, false);
  }
});

test("only evidenced personal facts enter first-person answers", () => {
  const workspace = fixture();
  const result = buildPreparation(workspace);
  assert.equal(result.confirmedCount, 2);
  for (const answer of [result.introduction, result.stories[0].answer]) {
    assert.match(answer, /I implemented a Java API/);
    assert.match(answer, /I evaluated model responses/);
    for (const excluded of ["UNVERIFIED_PERSONAL_CLAIM", "TEAM_ONLY_CLAIM", "CONTEXT_ONLY_CLAIM", "PRIVATE_REFLECTION_NOT_EXPERIENCE"]) {
      assert.equal(answer.includes(excluded), false);
    }
  }
  assert.equal(result.stories[0].excludedCount, 3);
  assert.equal(result.stories[0].teamContext, "TEAM_ONLY_CLAIM");
  assert.equal(result.stories[0].teamContext.includes("UNVERIFIED_PERSONAL_CLAIM"), false);
});

test("changing role focus changes emphasis and follow-ups without changing profile facts", () => {
  const workspace = fixture();
  const originalProfile = structuredClone(workspace.profile);
  const payments = buildPreparation(workspace);
  const ai = buildPreparation({ ...workspace, context: { ...workspace.context, focus: "applied-ai" } });
  const platform = buildPreparation({ ...workspace, context: { ...workspace.context, focus: "backend-platform" } });
  assert.notEqual(payments.introduction, ai.introduction);
  assert.notEqual(payments.stories[0].answer, platform.stories[0].answer);
  assert.notDeepEqual(payments.template.questions, ai.template.questions);
  assert.deepEqual(payments.stories[0].includedFactIds, ["java", "ai"]);
  assert.deepEqual(ai.stories[0].includedFactIds, ["ai", "java"]);
  assert.deepEqual(workspace.profile, originalProfile);
});

test("empty profile produces prompts rather than invented work history", () => {
  const empty = createEmptyWorkspace();
  assert.deepEqual(parseWorkspace(serializeWorkspace(empty)), { ok: true, value: empty });
  const result = buildPreparation(empty);
  assert.equal(result.confirmedCount, 0);
  assert.match(result.introduction, /Add a user-confirmed personal fact/);
  assert.deepEqual(result.stories, []);
  const another = createEmptyWorkspace();
  empty.profile.displayName = "Changed";
  assert.equal(another.profile.displayName, "");
});

test("company and title personalize the transition without inventing a company motive", () => {
  const workspace = fixture();
  const profileBefore = structuredClone(workspace.profile);
  workspace.context.company = "Example Company";
  workspace.context.roleTitle = "Java Engineer";
  workspace.context.notes = "UNVERIFIED_COMPANY_MOTIVE";
  const result = buildPreparation(workspace);
  for (const answer of [result.introduction, result.stories[0].answer]) {
    assert.match(answer, /the Java Engineer opportunity at Example Company/);
    assert.equal(answer.includes(workspace.context.notes), false);
  }
  assert.deepEqual(workspace.profile, profileBefore);
});
