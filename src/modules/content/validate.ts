import type {
  CodeExample,
  CourseRevision,
  LocalizedText,
  PublishedContentData,
  QuestionIdentity,
  QuestionRevision,
  SectionIdentity,
  SectionRevision,
  TeachingExample,
} from "./model";

type Identified = Readonly<{ id: string }>;
const pathSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function indexById<T extends Identified>(
  label: string,
  items: readonly T[],
): Map<string, T> {
  const index = new Map<string, T>();

  for (const item of items) {
    if (index.has(item.id)) {
      throw new Error(`Duplicate ${label} ID: ${item.id}`);
    }

    index.set(item.id, item);
  }

  return index;
}

function requireReference<T>(
  index: ReadonlyMap<string, T>,
  label: string,
  id: string,
): T {
  const value = index.get(id);

  if (!value) {
    throw new Error(`Missing ${label}: ${id}`);
  }

  return value;
}

function assertUniqueValues(label: string, values: readonly string[]): void {
  const seen = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`Duplicate ${label}: ${value}`);
    }

    seen.add(value);
  }
}

function assertNonEmptyText(label: string, value: string): void {
  if (!value.trim()) {
    throw new Error(`Empty ${label}`);
  }
}

function assertTextList(label: string, values: readonly string[]): void {
  if (values.length === 0) {
    throw new Error(`Empty ${label}`);
  }

  values.forEach((value, index) =>
    assertNonEmptyText(`${label} item ${index + 1}`, value),
  );
}

function assertLocalizedText(label: string, value: LocalizedText): void {
  assertNonEmptyText(`${label} English text`, value.en);
  assertNonEmptyText(`${label} Chinese text`, value.zhHans);
}

function assertCodeExample(label: string, example: CodeExample): void {
  assertNonEmptyText(`${label} language`, example.language);
  assertNonEmptyText(`${label} code`, example.code);
  assertNonEmptyText(
    `${label} Chinese explanation`,
    example.explanationZhHans,
  );
}

function assertTeachingExample(
  label: string,
  example: TeachingExample,
): void {
  if (example.kind === "code") {
    assertCodeExample(label, example);
    return;
  }

  assertNonEmptyText(`${label} title`, example.title);

  if (example.kind === "diagram") {
    assertNonEmptyText(
      `${label} Chinese diagram description`,
      example.descriptionZhHans,
    );
    return;
  }

  assertNonEmptyText(
    `${label} Chinese explanation`,
    example.explanationZhHans,
  );
}

function assertQuestionContent(revision: QuestionRevision): void {
  const label = `question revision ${revision.id}`;
  const content = revision.content;
  const english = content.englishInterviewAnswer;
  const chinese = content.chineseDeepDive;

  assertLocalizedText(`${label} prompt`, content.prompt);
  if (content.originalGuide) {
    const guide = content.originalGuide;
    assertNonEmptyText(`${label} original question number`, guide.questionNumber);
    assertNonEmptyText(`${label} original source`, guide.sourceFile);
    if (!Number.isInteger(guide.sourceLine) || guide.sourceLine < 1 || guide.blocks.length !== 4) {
      throw new Error(`Invalid ${label} original guide structure`);
    }
    for (const block of guide.blocks) {
      for (const [field, value] of Object.entries(block)) assertNonEmptyText(`${label} original ${field}`, value);
    }
  }
  assertNonEmptyText(`${label} English answer`, english.answer);
  assertTextList(`${label} English key points`, english.keyPoints);

  if (english.codeExample) {
    assertCodeExample(`${label} English code example`, english.codeExample);
  }

  assertTextList(`${label} Chinese definitions`, chinese.definition);
  assertTextList(`${label} Chinese mechanisms`, chinese.coreMechanism);

  if (chinese.examples.length === 0) {
    throw new Error(`Empty ${label} Chinese examples`);
  }

  chinese.examples.forEach((example, index) =>
    assertTeachingExample(`${label} Chinese example ${index + 1}`, example),
  );
  assertTextList(`${label} Chinese use cases`, chinese.useCases);
  assertTextList(`${label} Chinese common mistakes`, chinese.commonMistakes);

  if (chinese.followUpQuestions.length === 0) {
    throw new Error(`Empty ${label} Chinese follow-up questions`);
  }

  chinese.followUpQuestions.forEach((followUp, index) => {
    assertNonEmptyText(
      `${label} Chinese follow-up ${index + 1} question`,
      followUp.question,
    );
    assertNonEmptyText(
      `${label} Chinese follow-up ${index + 1} answer`,
      followUp.answer,
    );
  });
  assertNonEmptyText(
    `${label} Chinese interview summary`,
    chinese.interviewSummary,
  );
}

function assertRevisionNumbers<T extends Identified & { revisionNumber: number }>(
  label: string,
  revisions: readonly T[],
  ownerId: (revision: T) => string,
): void {
  const keys = revisions.map((revision) => {
    if (
      !Number.isInteger(revision.revisionNumber) ||
      revision.revisionNumber < 1
    ) {
      throw new Error(
        `Invalid ${label} revision number: ${revision.revisionNumber}`,
      );
    }

    return `${ownerId(revision)}:${revision.revisionNumber}`;
  });

  assertUniqueValues(`${label} revision number`, keys);
}

function assertCourseSnapshot(
  courseRevision: CourseRevision,
  sectionById: ReadonlyMap<string, SectionIdentity>,
  sectionRevisionById: ReadonlyMap<string, SectionRevision>,
  questionById: ReadonlyMap<string, QuestionIdentity>,
  questionRevisionById: ReadonlyMap<string, QuestionRevision>,
): void {
  if (courseRevision.sectionRevisionIds.length === 0) {
    throw new Error(`Empty course revision: ${courseRevision.id}`);
  }

  assertUniqueValues(
    `section revision in course revision ${courseRevision.id}`,
    courseRevision.sectionRevisionIds,
  );

  const sectionIds: string[] = [];
  const questionIds: string[] = [];
  const questionSlugs: string[] = [];

  for (const sectionRevisionId of courseRevision.sectionRevisionIds) {
    const sectionRevision = requireReference(
      sectionRevisionById,
      "section revision",
      sectionRevisionId,
    );
    const section = requireReference(
      sectionById,
      "section identity",
      sectionRevision.sectionId,
    );

    if (section.courseId !== courseRevision.courseId) {
      throw new Error(
        `Section ${section.id} belongs to the wrong course in ${courseRevision.id}`,
      );
    }

    if (sectionRevision.questionRevisionIds.length === 0) {
      throw new Error(`Empty section revision: ${sectionRevision.id}`);
    }

    sectionIds.push(section.id);
    assertUniqueValues(
      `question revision in section revision ${sectionRevision.id}`,
      sectionRevision.questionRevisionIds,
    );

    for (const questionRevisionId of sectionRevision.questionRevisionIds) {
      const questionRevision = requireReference(
        questionRevisionById,
        "question revision",
        questionRevisionId,
      );
      const question = requireReference(
        questionById,
        "question identity",
        questionRevision.questionId,
      );

      if (question.courseId !== courseRevision.courseId) {
        throw new Error(
          `Question ${question.id} belongs to the wrong course in ${courseRevision.id}`,
        );
      }

      questionIds.push(question.id);
      questionSlugs.push(question.slug);
    }
  }

  assertUniqueValues(
    `section identity in course revision ${courseRevision.id}`,
    sectionIds,
  );
  assertUniqueValues(
    `question identity in course revision ${courseRevision.id}`,
    questionIds,
  );
  assertUniqueValues(
    `question slug in course revision ${courseRevision.id}`,
    questionSlugs,
  );
}

export function validatePublishedContentData(
  data: PublishedContentData,
): void {
  const courseById = indexById("course", data.courses);
  const courseRevisionById = indexById(
    "course revision",
    data.courseRevisions,
  );
  const sectionById = indexById("section", data.sections);
  const sectionRevisionById = indexById(
    "section revision",
    data.sectionRevisions,
  );
  const questionById = indexById("question", data.questions);
  const questionRevisionById = indexById(
    "question revision",
    data.questionRevisions,
  );

  assertRevisionNumbers(
    "course",
    data.courseRevisions,
    (revision) => revision.courseId,
  );
  assertRevisionNumbers(
    "section",
    data.sectionRevisions,
    (revision) => revision.sectionId,
  );
  assertRevisionNumbers(
    "question",
    data.questionRevisions,
    (revision) => revision.questionId,
  );

  assertUniqueValues(
    "course slug",
    data.courses.map((course) => course.slug),
  );

  for (const course of data.courses) {
    if (!pathSlugPattern.test(course.slug)) {
      throw new Error(`Invalid course slug: ${course.slug}`);
    }
  }

  for (const section of data.sections) {
    requireReference(courseById, "course identity", section.courseId);
  }

  for (const question of data.questions) {
    requireReference(courseById, "course identity", question.courseId);

    if (!pathSlugPattern.test(question.slug)) {
      throw new Error(`Invalid question slug: ${question.slug}`);
    }
  }

  for (const revision of data.courseRevisions) {
    requireReference(courseById, "course identity", revision.courseId);
    assertLocalizedText(`course revision ${revision.id} title`, revision.title);
    assertLocalizedText(
      `course revision ${revision.id} description`,
      revision.description,
    );

    if (!Number.isInteger(revision.order) || revision.order < 1) {
      throw new Error(`Invalid course order in revision ${revision.id}`);
    }
  }

  for (const revision of data.sectionRevisions) {
    requireReference(sectionById, "section identity", revision.sectionId);
    assertLocalizedText(
      `section revision ${revision.id} title`,
      revision.title,
    );
    assertLocalizedText(
      `section revision ${revision.id} description`,
      revision.description,
    );
  }

  for (const revision of data.questionRevisions) {
    requireReference(questionById, "question identity", revision.questionId);
    assertQuestionContent(revision);
  }

  const sectionIdsWithRevisions = new Set(
    data.sectionRevisions.map((revision) => revision.sectionId),
  );
  const questionIdsWithRevisions = new Set(
    data.questionRevisions.map((revision) => revision.questionId),
  );

  for (const section of data.sections) {
    if (!sectionIdsWithRevisions.has(section.id)) {
      throw new Error(`Orphan section identity: ${section.id}`);
    }
  }

  for (const question of data.questions) {
    if (!questionIdsWithRevisions.has(question.id)) {
      throw new Error(`Orphan question identity: ${question.id}`);
    }
  }

  const currentCourseRevisions = data.courses.map((course) => {
    const revision = requireReference(
      courseRevisionById,
      "published course revision",
      course.publishedRevisionId,
    );

    if (revision.courseId !== course.id) {
      throw new Error(`Published course revision has wrong owner: ${course.id}`);
    }

    return revision;
  });

  assertUniqueValues(
    "published course order",
    currentCourseRevisions.map((revision) => String(revision.order)),
  );

  const referencedSectionRevisionIds = new Set<string>();
  const referencedQuestionRevisionIds = new Set<string>();

  for (const courseRevision of data.courseRevisions) {
    assertCourseSnapshot(
      courseRevision,
      sectionById,
      sectionRevisionById,
      questionById,
      questionRevisionById,
    );

    for (const sectionRevisionId of courseRevision.sectionRevisionIds) {
      referencedSectionRevisionIds.add(sectionRevisionId);
      const sectionRevision = requireReference(
        sectionRevisionById,
        "section revision",
        sectionRevisionId,
      );

      for (const questionRevisionId of sectionRevision.questionRevisionIds) {
        referencedQuestionRevisionIds.add(questionRevisionId);
      }
    }
  }

  for (const sectionRevision of data.sectionRevisions) {
    if (!referencedSectionRevisionIds.has(sectionRevision.id)) {
      throw new Error(
        `Orphan published section revision: ${sectionRevision.id}`,
      );
    }
  }

  for (const questionRevision of data.questionRevisions) {
    if (!referencedQuestionRevisionIds.has(questionRevision.id)) {
      throw new Error(
        `Orphan published question revision: ${questionRevision.id}`,
      );
    }
  }
}
