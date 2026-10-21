import assert from "node:assert/strict";
import test from "node:test";
import { jdRoadmap } from "../../src/modules/content/jd-roadmap";
import { jdReviewCourse } from "../../src/modules/content/jd-review-course";
import { getPublishedQuestion } from "../../src/modules/content/public";

test("JD roadmap resolves every core lesson and covers both new topics and the entire Kafka path", async () => {
  const paths = jdRoadmap.flatMap((area) => area.lessons);
  assert.equal(new Set(paths.map((path) => `${path.courseSlug}/${path.slug}`)).size, 27);
  assert.equal(paths.filter((path) => path.courseSlug === "backend-systems").length, 8);
  const resolved = await Promise.all(paths.map((path) => getPublishedQuestion(path.courseSlug, path.slug)));
  assert.ok(resolved.every(Boolean), "A roadmap link must never silently disappear");
  for (const lesson of resolved) {
    assert.ok(lesson?.revision.content.practice?.length);
    assert.ok(lesson?.revision.content.sources?.length);
  }
  const ids = new Set(resolved.map((lesson) => lesson?.question.id));
  for (const question of jdReviewCourse.questions) assert.ok(ids.has(question.id), `Unmapped JD lesson: ${question.slug}`);
});
