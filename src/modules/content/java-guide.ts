import type { PublishedContentData, QuestionRevision } from "./model";
import { javaGuideErrata } from "./java-guide-errata";
import { javaGuideSource } from "./java-guide-source";
import type { JavaGuideModule, JavaGuideQuestion } from "./java-guide-source-model";

const publishedAt = "2026-10-20T00:00:00.000Z";

function courseId(module: JavaGuideModule): string {
  return `course_${module.slug.replaceAll("-", "_")}`;
}

function questionRevision(
  module: JavaGuideModule,
  question: JavaGuideQuestion,
): QuestionRevision {
  const [conclusion, deepDive, followUp, pitfall] = question.blocks;
  const erratum = javaGuideErrata[question.questionNumber];

  return {
    id: `question_revision_java_${question.questionNumber}_1`,
    questionId: `question_java_${question.questionNumber}`,
    revisionNumber: 1,
    schemaVersion: 1,
    publishedAt,
    difficulty: question.difficulty,
    content: {
      prompt: question.prompt,
      // The paired originalGuide renderer owns this lesson's presentation.
      // Compatibility fields reference source paragraphs without inventing examples.
      englishInterviewAnswer: {
        answer: conclusion.en,
        keyPoints: [deepDive.en, followUp.en, pitfall.en],
      },
      chineseDeepDive: {
        definition: [conclusion.zh],
        coreMechanism: [deepDive.zh],
        examples: [
          {
            kind: "prose",
            title: followUp.labelZh,
            explanationZhHans: followUp.zh,
          },
        ],
        useCases: [deepDive.zh],
        commonMistakes: [pitfall.zh],
        followUpQuestions: [{ question: followUp.labelZh, answer: followUp.zh }],
        interviewSummary: conclusion.zh,
      },
      originalGuide: {
        questionNumber: question.questionNumber,
        sourceFile: module.sourceFile,
        sourceLine: question.sourceLine,
        blocks: question.blocks,
      },
      ...(erratum
        ? {
            practice: [{ question: erratum.question, answer: erratum.answer }],
            sources: [erratum.source],
          }
        : {}),
    },
  };
}

export const javaGuideCourses: PublishedContentData = {
  courses: javaGuideSource.map((module) => ({
    id: courseId(module),
    slug: module.slug,
    publishedRevisionId: `${courseId(module)}_revision_1`,
  })),
  courseRevisions: javaGuideSource.map((module, index) => ({
    id: `${courseId(module)}_revision_1`,
    courseId: courseId(module),
    revisionNumber: 1,
    schemaVersion: 1,
    publishedAt,
    order: index + 3,
    title: module.title,
    description: {
      en: "Original Java/Spring interview guide: 20 questions with paired conclusions, deep dives, follow-ups, and common pitfalls. Java 17/21; Spring Framework 6+ and Boot 3+ baseline.",
      zhHans:
        "原 Java/Spring 面试题库：20 题，按原文保留中英结论、展开、追问与易错点。基线为 Java 17/21、Spring Framework 6+ 与 Spring Boot 3+。",
    },
    sectionRevisionIds: [`${courseId(module)}_section_revision_1`],
  })),
  sections: javaGuideSource.map((module) => ({
    id: `${courseId(module)}_section`,
    courseId: courseId(module),
  })),
  sectionRevisions: javaGuideSource.map((module) => ({
    id: `${courseId(module)}_section_revision_1`,
    sectionId: `${courseId(module)}_section`,
    revisionNumber: 1,
    schemaVersion: 1,
    publishedAt,
    title: {
      en: `Questions ${module.questions[0].questionNumber}–${module.questions.at(-1)!.questionNumber}`,
      zhHans: `第 ${module.questions[0].questionNumber}–${module.questions.at(-1)!.questionNumber} 题`,
    },
    description: {
      en: "Read each Chinese block alongside its original English counterpart.",
      zhHans: "逐段对照原始中文与英文；存在已核对的表述问题时，另附校对说明。",
    },
    questionRevisionIds: module.questions.map(
      (question) => `question_revision_java_${question.questionNumber}_1`,
    ),
  })),
  questions: javaGuideSource.flatMap((module) =>
    module.questions.map((question) => ({
      id: `question_java_${question.questionNumber}`,
      courseId: courseId(module),
      slug: `question-${question.questionNumber}`,
    })),
  ),
  questionRevisions: javaGuideSource.flatMap((module) =>
    module.questions.map((question) => questionRevision(module, question)),
  ),
};
