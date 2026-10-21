import assert from "node:assert/strict";
import test from "node:test";
import { parseStudioBundle } from "../../src/modules/preparation/studio-model";
import { getBehaviorMap } from "../../src/modules/preparation/behavior-map";

function fixture() {
  return {
    schemaVersion: 1,
    behavior: {
      introLocked: "Fictional introduction, preserved exactly.",
      sources: [],
      factNotes: [["Boundary", "A fictional training example."]],
      questions: [{ id: "qa-question", title: "Example question", status: "ready", answer: "Example answer", outline: [], storyIds: ["qa-story"] }],
      stories: [{ id: "qa-story", title: "Example story", readiness: "needs-details", star: { s: "Situation", t: "Task", a: "[Add real action]", r: "[Add real result]" }, spoken: "[Add verified details]", tags: [] }],
    },
    foundations: {
      modules: [{ id: "qa-module", title: "Example module", order: 1 }],
      questions: [{ id: "qa-concept", title: "Example concept", module: "qa-module", lesson: "An explanation", englishAnswer: "An English answer", options: ["A", "B", "C", "D"], correctIndex: 0 }],
      sources: [],
    },
  };
}

test("Studio import preserves locked introduction, original IDs, notes and incomplete story status", () => {
  const original = fixture();
  assert.deepEqual(parseStudioBundle(JSON.stringify(original)), original);
});

test("Studio import rejects profile files, malformed STAR and invalid module or quiz references", () => {
  assert.throws(() => parseStudioBundle("{"), /JSON/);
  assert.throws(() => parseStudioBundle('{"schemaVersion":1,"profile":{}}'), /Studio/);
  const noStar = fixture();
  delete (noStar.behavior.stories[0] as Partial<typeof noStar.behavior.stories[0]>).star;
  assert.throws(() => parseStudioBundle(JSON.stringify(noStar)), /STAR/);
  const badModule = fixture();
  badModule.foundations.questions[0].module = "missing";
  assert.throws(() => parseStudioBundle(JSON.stringify(badModule)), /基础题/);
  const badAnswer = fixture();
  badAnswer.foundations.questions[0].correctIndex = 4;
  assert.throws(() => parseStudioBundle(JSON.stringify(badAnswer)), /基础题/);
  const badNotes = { ...fixture(), behavior: { ...fixture().behavior, factNotes: "invalid" } };
  assert.throws(() => parseStudioBundle(JSON.stringify(badNotes)), /事实边界/);
  const badFollowUp = fixture();
  Object.assign(badFollowUp.foundations.questions[0], { followUpAnswers: "invalid" });
  assert.throws(() => parseStudioBundle(JSON.stringify(badFollowUp)), /追问/);
  const missingStory = fixture();
  missingStory.behavior.questions[0].storyIds = ["missing"];
  assert.throws(() => parseStudioBundle(JSON.stringify(missingStory)), /不存在的故事/);
  const noReadiness = fixture();
  delete (noReadiness.behavior.stories[0] as Partial<typeof noReadiness.behavior.stories[0]>).readiness;
  assert.throws(() => parseStudioBundle(JSON.stringify(noReadiness)), /状态/);
});

test("competency map preserves all questions, exposes gaps and rejects broken evidence links", () => {
  const source = fixture();
  const bundle = { ...source, behavior: { ...source.behavior,
    questions: [...source.behavior.questions, { ...source.behavior.questions[0], id: "unmapped", answer: "[Add actual action]" }],
    competencies: [{ id: "leadership", title: "Leadership", description: "Explain a real decision", practiceGoal: "Name your action", questionIds: ["qa-question"], storyIds: ["qa-story"] }],
  } };
  const map = getBehaviorMap(parseStudioBundle(JSON.stringify(bundle)));
  assert.equal(map.questions.length, 2, "A question outside the competency list remains reachable through All");
  assert.deepEqual(map.needsDetails.map((question) => question.id), ["unmapped"], "A ready label must not hide placeholders");
  bundle.behavior.competencies[0].questionIds = ["missing"];
  assert.throws(() => parseStudioBundle(JSON.stringify(bundle)), /不存在/);
});
