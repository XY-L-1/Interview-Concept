import type {
  CourseIdentity,
  CourseOutline,
  CourseRevision,
  CourseSummary,
  PublishedQuestionLesson,
  PublishedQuestionPath,
  QuestionIdentity,
  QuestionRevision,
  QuestionSummary,
  SectionOutline,
  SectionRevision,
} from "./model";
import { publishedContent } from "./published-content";
import { validatePublishedContentData } from "./validate";

validatePublishedContentData(publishedContent);

type PublishedCourseRecord = Readonly<{
  identity: CourseIdentity;
  revision: CourseRevision;
}>;

function requireCourseRevision(
  revisionId: string,
  courseId?: string,
): CourseRevision {
  const revision = publishedContent.courseRevisions.find(
    (candidate) => candidate.id === revisionId,
  );

  if (!revision || (courseId && revision.courseId !== courseId)) {
    throw new Error(`Invalid published course revision ${revisionId}`);
  }

  return revision;
}

function requireSectionRevision(revisionId: string): SectionRevision {
  const revision = publishedContent.sectionRevisions.find(
    (candidate) => candidate.id === revisionId,
  );

  if (!revision) {
    throw new Error(`Invalid published section revision ${revisionId}`);
  }

  return revision;
}

function requireQuestionRevision(revisionId: string): QuestionRevision {
  const revision = publishedContent.questionRevisions.find(
    (candidate) => candidate.id === revisionId,
  );

  if (!revision) {
    throw new Error(`Invalid published question revision ${revisionId}`);
  }

  return revision;
}

function requireQuestionIdentity(questionId: string): QuestionIdentity {
  const identity = publishedContent.questions.find(
    (candidate) => candidate.id === questionId,
  );

  if (!identity) {
    throw new Error(`Invalid question identity ${questionId}`);
  }

  return identity;
}

function getCurrentCourseRecord(
  identity: CourseIdentity,
): PublishedCourseRecord {
  return {
    identity,
    revision: requireCourseRevision(
      identity.publishedRevisionId,
      identity.id,
    ),
  };
}

function findPublishedCourse(courseSlug: string): PublishedCourseRecord | null {
  return (
    publishedContent.courses
      .map(getCurrentCourseRecord)
      .find(({ identity }) => identity.slug === courseSlug) ?? null
  );
}

function toQuestionSummary(
  revision: QuestionRevision,
  order: number,
): QuestionSummary {
  const identity = requireQuestionIdentity(revision.questionId);

  return {
    id: revision.questionId,
    revisionId: revision.id,
    slug: identity.slug,
    order,
    difficulty: revision.difficulty,
    prompt: revision.content.prompt,
  };
}

function buildSectionOutlines(
  courseRevision: CourseRevision,
): readonly SectionOutline[] {
  return courseRevision.sectionRevisionIds.map((sectionRevisionId, index) => {
    const revision = requireSectionRevision(sectionRevisionId);
    const questions = revision.questionRevisionIds.map(
      (questionRevisionId, questionIndex) =>
        toQuestionSummary(
          requireQuestionRevision(questionRevisionId),
          questionIndex + 1,
        ),
    );

    return {
      id: revision.sectionId,
      revisionId: revision.id,
      order: index + 1,
      title: revision.title,
      description: revision.description,
      questions,
    };
  });
}

export async function listPublishedCourses(): Promise<
  readonly CourseSummary[]
> {
  return publishedContent.courses
    .map(getCurrentCourseRecord)
    .toSorted((left, right) => left.revision.order - right.revision.order)
    .map(({ identity, revision }) => {
      const sections = buildSectionOutlines(revision);
      const questions = sections.flatMap((section) => section.questions);

      return {
        id: identity.id,
        revisionId: revision.id,
        slug: identity.slug,
        title: revision.title,
        description: revision.description,
        sectionCount: sections.length,
        questionCount: questions.length,
      };
    });
}

export async function getPublishedCourse(
  courseSlug: string,
): Promise<CourseOutline | null> {
  const record = findPublishedCourse(courseSlug);

  if (!record) {
    return null;
  }

  const sections = buildSectionOutlines(record.revision);

  return {
    id: record.identity.id,
    revisionId: record.revision.id,
    slug: record.identity.slug,
    title: record.revision.title,
    description: record.revision.description,
    sections,
    questionCount: sections.reduce(
      (total, section) => total + section.questions.length,
      0,
    ),
  };
}

export async function getPublishedQuestion(
  courseSlug: string,
  questionSlug: string,
): Promise<PublishedQuestionLesson | null> {
  const course = await getPublishedCourse(courseSlug);

  if (!course) {
    return null;
  }

  const orderedQuestions = course.sections.flatMap((section) =>
    section.questions.map((question) => ({ question, section })),
  );
  const questionIndex = orderedQuestions.findIndex(
    ({ question }) => question.slug === questionSlug,
  );

  if (questionIndex === -1) {
    return null;
  }

  const current = orderedQuestions[questionIndex];
  const previous = orderedQuestions[questionIndex - 1]?.question ?? null;
  const next = orderedQuestions[questionIndex + 1]?.question ?? null;

  return {
    course: {
      id: course.id,
      slug: course.slug,
      title: course.title,
    },
    sections: course.sections,
    section: {
      id: current.section.id,
      title: current.section.title,
    },
    question: current.question,
    revision: requireQuestionRevision(current.question.revisionId),
    questionNumber: questionIndex + 1,
    questionCount: orderedQuestions.length,
    previous: previous
      ? { slug: previous.slug, prompt: previous.prompt.en }
      : null,
    next: next ? { slug: next.slug, prompt: next.prompt.en } : null,
  };
}

export async function listPublishedCourseParams(): Promise<
  Pick<PublishedQuestionPath, "courseSlug">[]
> {
  return publishedContent.courses.map((course) => ({
    courseSlug: course.slug,
  }));
}

export async function listPublishedQuestionParams(): Promise<
  PublishedQuestionPath[]
> {
  return publishedContent.courses.flatMap((course) => {
    const courseRevision = requireCourseRevision(
      course.publishedRevisionId,
      course.id,
    );

    return courseRevision.sectionRevisionIds.flatMap((sectionRevisionId) => {
      const sectionRevision = requireSectionRevision(sectionRevisionId);

      return sectionRevision.questionRevisionIds.map((questionRevisionId) => ({
        courseSlug: course.slug,
        questionSlug: requireQuestionIdentity(
          requireQuestionRevision(questionRevisionId).questionId,
        ).slug,
      }));
    });
  });
}
