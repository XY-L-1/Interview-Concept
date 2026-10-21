import assert from "node:assert/strict";
import test from "node:test";
import type { PublishedContentData } from "../../src/modules/content/model";
import {
  getPublishedCourse,
  getPublishedQuestion,
  listPublishedCourses,
  listPublishedQuestionParams,
} from "../../src/modules/content/public";
import { publishedContent } from "../../src/modules/content/published-content";
import { validatePublishedContentData } from "../../src/modules/content/validate";

test("published course outline preserves explicit section and question order", async () => {
  const courses = await listPublishedCourses();
  const react = await getPublishedCourse("react");

  assert.equal(courses.length, 11);
  assert.equal(courses[0]?.slug, "backend-systems");
  assert.equal(courses.find((course) => course.slug === "react")?.questionCount, 5);
  assert.ok(react);
  assert.deepEqual(
    react.sections.map((section) => section.title.en),
    ["Core Concepts", "Component Behavior"],
  );
  assert.deepEqual(
    react.sections.flatMap((section) =>
      section.questions.map((question) => question.slug),
    ),
    [
      "what-is-react",
      "how-virtual-dom-works",
      "props-vs-state",
      "controlled-components",
      "rules-of-hooks",
    ],
  );
});

test("every published question exposes both complete answer experiences", async () => {
  const paths = await listPublishedQuestionParams();

  assert.equal(paths.length, 192);

  for (const path of paths) {
    const lesson = await getPublishedQuestion(
      path.courseSlug,
      path.questionSlug,
    );

    assert.ok(lesson);
    assert.ok(lesson.revision.content.englishInterviewAnswer.answer.trim());
    assert.ok(lesson.revision.content.englishInterviewAnswer.keyPoints.length);

    const chinese = lesson.revision.content.chineseDeepDive;
    assert.ok(chinese.definition.length);
    assert.ok(chinese.coreMechanism.length);
    assert.ok(chinese.examples.length);
    assert.ok(chinese.useCases.length);
    assert.ok(chinese.commonMistakes.length);
    assert.ok(chinese.followUpQuestions.length);
    assert.ok(chinese.interviewSummary.trim());
  }
});

test("previous and next navigation follow the same curriculum order", async () => {
  const lesson = await getPublishedQuestion("react", "props-vs-state");

  assert.ok(lesson);
  assert.equal(lesson.questionNumber, 3);
  assert.equal(lesson.previous?.slug, "how-virtual-dom-works");
  assert.equal(lesson.next?.slug, "controlled-components");
});

test("unknown public content is not returned", async () => {
  assert.equal(await getPublishedCourse("unknown"), null);
  assert.equal(await getPublishedQuestion("react", "unknown"), null);
  assert.equal(await getPublishedQuestion("unknown", "what-is-react"), null);
});

test("a new course release preserves the previous structure and question revision", () => {
  const oldCourseRevision = publishedContent.courseRevisions[0];
  const oldCoreSectionRevision = publishedContent.sectionRevisions[0];
  const oldBehaviorSectionRevision = publishedContent.sectionRevisions[1];
  const questionIdentity = publishedContent.questions.find(
    (question) => question.id === "question_props_vs_state",
  );
  const oldQuestionRevision = publishedContent.questionRevisions.find(
    (revision) => revision.id === "question_revision_props_vs_state_1",
  );

  assert.ok(oldCourseRevision);
  assert.ok(oldCoreSectionRevision);
  assert.ok(oldBehaviorSectionRevision);
  assert.ok(questionIdentity);
  assert.ok(oldQuestionRevision);

  const newQuestionRevision = {
    ...oldQuestionRevision,
    id: "question_revision_props_vs_state_2",
    revisionNumber: 2,
    difficulty: "intermediate" as const,
    content: {
      ...oldQuestionRevision.content,
      prompt: {
        en: "How do props and state differ in React?",
        zhHans: "React 中的 props 和 state 有什么区别？",
      },
    },
  };
  const newCoreSectionRevision = {
    ...oldCoreSectionRevision,
    id: "section_revision_react_core_2",
    revisionNumber: 2,
    questionRevisionIds: [
      newQuestionRevision.id,
      "question_revision_what_is_react_1",
      "question_revision_virtual_dom_1",
      "question_revision_controlled_components_1",
    ],
  };
  const newBehaviorSectionRevision = {
    ...oldBehaviorSectionRevision,
    id: "section_revision_react_behavior_2",
    revisionNumber: 2,
    questionRevisionIds: ["question_revision_rules_of_hooks_1"],
  };
  const newCourseRevision = {
    ...oldCourseRevision,
    id: "course_revision_react_2",
    revisionNumber: 2,
    sectionRevisionIds: [
      newBehaviorSectionRevision.id,
      newCoreSectionRevision.id,
    ],
  };
  const versionedData: PublishedContentData = {
    ...publishedContent,
    courses: publishedContent.courses.map((course) =>
      course.id === "course_react"
        ? { ...course, publishedRevisionId: newCourseRevision.id }
        : course,
    ),
    courseRevisions: [...publishedContent.courseRevisions, newCourseRevision],
    sectionRevisions: [
      ...publishedContent.sectionRevisions,
      newCoreSectionRevision,
      newBehaviorSectionRevision,
    ],
    questionRevisions: [
      ...publishedContent.questionRevisions,
      newQuestionRevision,
    ],
  };

  validatePublishedContentData(versionedData);

  assert.deepEqual(oldCourseRevision.sectionRevisionIds, [
    "section_revision_react_core_1",
    "section_revision_react_behavior_1",
  ]);
  assert.deepEqual(newCourseRevision.sectionRevisionIds, [
    "section_revision_react_behavior_2",
    "section_revision_react_core_2",
  ]);
  assert.deepEqual(oldBehaviorSectionRevision.questionRevisionIds, [
    "question_revision_controlled_components_1",
    "question_revision_rules_of_hooks_1",
  ]);
  assert.deepEqual(newBehaviorSectionRevision.questionRevisionIds, [
    "question_revision_rules_of_hooks_1",
  ]);
  assert.equal(
    newCoreSectionRevision.questionRevisionIds.at(-1),
    "question_revision_controlled_components_1",
  );
  assert.equal(questionIdentity.slug, "props-vs-state");
  assert.equal(
    oldQuestionRevision.content.prompt.en,
    "What is the difference between props and state in React?",
  );
  assert.equal(
    newQuestionRevision.content.prompt.en,
    "How do props and state differ in React?",
  );
  assert.equal(oldQuestionRevision.difficulty, "beginner");
  assert.equal(newQuestionRevision.difficulty, "intermediate");
  assert.equal(
    versionedData.courses[0]?.publishedRevisionId,
    "course_revision_react_2",
  );
});

test("published content validation rejects broken references and ambiguity", () => {
  const fixtures: readonly Readonly<{
    name: string;
    data: PublishedContentData;
    message: RegExp;
  }>[] = [
    {
      name: "missing question revision",
      data: {
        ...publishedContent,
        sectionRevisions: publishedContent.sectionRevisions.map((revision) =>
          revision.id === "section_revision_react_core_1"
            ? {
                ...revision,
                questionRevisionIds: [
                  ...revision.questionRevisionIds,
                  "question_revision_missing",
                ],
              }
            : revision,
        ),
      },
      message: /Missing question revision/,
    },
    {
      name: "duplicate question slug",
      data: {
        ...publishedContent,
        questions: publishedContent.questions.map((question) =>
          question.id === "question_virtual_dom"
            ? { ...question, slug: "what-is-react" }
            : question,
        ),
      },
      message: /Duplicate question slug/,
    },
    {
      name: "orphan section identity",
      data: {
        ...publishedContent,
        sections: [
          ...publishedContent.sections,
          { id: "section_orphan", courseId: "course_react" },
        ],
      },
      message: /Orphan section identity/,
    },
    {
      name: "blank canonical answer",
      data: {
        ...publishedContent,
        questionRevisions: publishedContent.questionRevisions.map((revision) =>
          revision.id === "question_revision_what_is_react_1"
            ? {
                ...revision,
                content: {
                  ...revision.content,
                  englishInterviewAnswer: {
                    ...revision.content.englishInterviewAnswer,
                    answer: " ",
                  },
                },
              }
            : revision,
        ),
      },
      message: /Empty question revision .* English answer/,
    },
    {
      name: "empty published section",
      data: {
        ...publishedContent,
        sectionRevisions: publishedContent.sectionRevisions.map((revision) =>
          revision.id === "section_revision_react_core_1"
            ? { ...revision, questionRevisionIds: [] }
            : revision,
        ),
      },
      message: /Empty section revision/,
    },
  ];

  for (const fixture of fixtures) {
    assert.throws(
      () => validatePublishedContentData(fixture.data),
      fixture.message,
      fixture.name,
    );
  }
});
