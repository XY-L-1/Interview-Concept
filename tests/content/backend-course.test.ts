import assert from "node:assert/strict";
import test from "node:test";
import { getPublishedCourse, getPublishedQuestion } from "../../src/modules/content/public";

test("backend curriculum teaches requests before Kafka and capacity before payment failures", async () => {
  const course = await getPublishedCourse("backend-systems");
  assert.ok(course);
  const questions = course.sections.flatMap((section) => section.questions);
  assert.equal(questions.length, 8);
  assert.equal(questions[0].slug, "request-and-async-translation");
  assert.equal(questions.at(-1)?.slug, "payment-timeouts-and-unknown-results");
  for (const question of questions) {
    const lesson = await getPublishedQuestion(course.slug, question.slug);
    assert.ok(lesson);
    assert.ok(lesson.revision.content.practice?.length);
    assert.ok(lesson.revision.content.sources?.length);
  }
});
