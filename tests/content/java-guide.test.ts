import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { javaGuideCourses } from "../../src/modules/content/java-guide";
import { javaGuideSource } from "../../src/modules/content/java-guide-source";
import { validatePublishedContentData } from "../../src/modules/content/validate";

test("all eight original modules become ordered courses covering questions 001–160", () => {
  validatePublishedContentData(javaGuideCourses);
  assert.equal(javaGuideCourses.courses.length, 8);
  assert.equal(javaGuideCourses.sections.length, 8);
  assert.equal(javaGuideCourses.questions.length, 160);
  assert.equal(javaGuideCourses.questionRevisions.length, 160);
  assert.deepEqual(
    javaGuideCourses.courseRevisions.map((revision) => revision.order),
    [3, 4, 5, 6, 7, 8, 9, 10],
  );
  javaGuideCourses.sectionRevisions.forEach((section) => {
    assert.equal(section.questionRevisionIds.length, 20);
  });
  assert.deepEqual(
    javaGuideCourses.questions.map((question) => question.slug),
    Array.from({ length: 160 }, (_, index) =>
      `question-${String(index + 1).padStart(3, "0")}`,
    ),
  );
});

test("the course adapter preserves all 640 paired original blocks and inline Markdown", () => {
  const revisions = new Map(
    javaGuideCourses.questionRevisions.map((revision) => [revision.questionId, revision]),
  );
  let pairedBlocks = 0;

  for (const guideModule of javaGuideSource) {
    assert.match(guideModule.sourceSha256, /^[a-f0-9]{64}$/u);
    for (const question of guideModule.questions) {
      const revision = revisions.get(`question_java_${question.questionNumber}`);
      assert.ok(revision);
      assert.deepEqual(revision.content.prompt, question.prompt);
      assert.deepEqual(revision.content.originalGuide, {
        questionNumber: question.questionNumber,
        sourceFile: guideModule.sourceFile,
        sourceLine: question.sourceLine,
        blocks: question.blocks,
      });
      assert.equal(question.blocks.length, 4);
      assert.deepEqual(
        question.blocks.map((block) => [block.labelZh, block.labelEn]),
        [
          ["结论", "Conclusion"],
          ["展开", "Deep dive"],
          ["追问", "Follow-up"],
          ["易错点", "Common pitfall"],
        ],
      );
      for (const block of question.blocks) {
        assert.ok(block.zh.trim());
        assert.ok(block.en.trim());
        pairedBlocks += 1;
      }
    }
  }

  assert.equal(pairedBlocks, 640);
  const equals = revisions.get("question_java_006")!.content.originalGuide!;
  assert.ok(equals.blocks[0].zh.includes("`equals`"));
  const runtime = revisions.get("question_java_001")!.content.originalGuide!;
  assert.ok(runtime.blocks[1].en.includes("`javac`"));
});

test("five documented corrections remain separate from the untouched original paragraphs", () => {
  const annotated = javaGuideCourses.questionRevisions.filter(
    (revision) => revision.content.practice,
  );
  assert.deepEqual(
    annotated.map((revision) => revision.content.originalGuide!.questionNumber),
    ["006", "011", "035", "077", "080"],
  );
  for (const revision of annotated) {
    assert.match(revision.content.practice![0].question, /^原文校对/u);
    assert.ok(revision.content.practice![0].answer.trim());
    assert.equal(new URL(revision.content.sources![0].url).hostname, "docs.oracle.com");
  }
  assert.ok(
    annotated[0].content.originalGuide!.blocks[1].zh.includes("对非空对象返回假"),
  );
});

const localSourceDirectory = resolve(
  process.cwd(),
  "../learning/java-spring-interview-guide",
);

test(
  "the snapshot retains every original bilingual paragraph and its source location",
  {
    skip: existsSync(localSourceDirectory)
      ? false
      : "Original Markdown sources live in the local Interview workspace, outside the website repository.",
  },
  () => {
    for (const guideModule of javaGuideSource) {
      const bytes = readFileSync(resolve(localSourceDirectory, guideModule.sourceFile));
      assert.equal(
        createHash("sha256").update(bytes).digest("hex"),
        guideModule.sourceSha256,
      );
      const lines = bytes.toString("utf8").split(/\r?\n/u);
      assert.equal(lines[0], `# ${guideModule.title.zhHans}`);
      assert.equal(lines[2], `*${guideModule.title.en}*`);

      guideModule.questions.forEach((question, index) => {
        const start = question.sourceLine - 1;
        const nextQuestion = guideModule.questions[index + 1];
        const end = nextQuestion ? nextQuestion.sourceLine - 1 : lines.length;
        const questionLines = lines.slice(start, end);
        assert.equal(
          questionLines[0],
          `## ${question.questionNumber}. ${question.prompt.zhHans}`,
        );
        assert.ok(questionLines.includes(`**English question:** ${question.prompt.en}`));
        const sourceBlocks = questionLines.filter(
          (line) => line.startsWith("**") && !line.startsWith("**English question:"),
        );
        const importedBlocks = question.blocks.flatMap((block) => [
          `**${block.labelZh}：** ${block.zh}`,
          `**${block.labelEn}:** ${block.en}`,
        ]);
        assert.deepEqual(importedBlocks, sourceBlocks);
      });
    }
  },
);
