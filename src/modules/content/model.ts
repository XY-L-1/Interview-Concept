export type Difficulty = "beginner" | "intermediate" | "advanced";

export type LocalizedText = Readonly<{
  en: string;
  zhHans: string;
}>;

export type CodeLanguage = "tsx" | "typescript" | "javascript" | "java";

export type CodeExample = Readonly<{
  kind: "code";
  language: CodeLanguage;
  code: string;
  explanationZhHans: string;
}>;

export type ProseExample = Readonly<{
  kind: "prose";
  title: string;
  explanationZhHans: string;
}>;

export type DiagramExample = Readonly<{
  kind: "diagram";
  title: string;
  descriptionZhHans: string;
}>;

export type TeachingExample = CodeExample | ProseExample | DiagramExample;

export type EnglishInterviewAnswer = Readonly<{
  answer: string;
  keyPoints: readonly string[];
  codeExample?: CodeExample;
}>;

export type ChineseFollowUp = Readonly<{
  question: string;
  answer: string;
}>;

export type ChineseDeepDive = Readonly<{
  definition: readonly string[];
  coreMechanism: readonly string[];
  examples: readonly TeachingExample[];
  useCases: readonly string[];
  commonMistakes: readonly string[];
  followUpQuestions: readonly ChineseFollowUp[];
  interviewSummary: string;
}>;

export type BilingualQuestionContent = Readonly<{
  prompt: LocalizedText;
  englishInterviewAnswer: EnglishInterviewAnswer;
  chineseDeepDive: ChineseDeepDive;
  sources?: readonly { title: string; url: string }[];
  practice?: readonly { question: string; answer: string }[];
}>;

export type CourseIdentity = Readonly<{
  id: string;
  slug: string;
  publishedRevisionId: string;
}>;

export type CourseRevision = Readonly<{
  id: string;
  courseId: string;
  revisionNumber: number;
  schemaVersion: 1;
  publishedAt: string;
  order: number;
  title: LocalizedText;
  description: LocalizedText;
  sectionRevisionIds: readonly string[];
}>;

export type SectionIdentity = Readonly<{
  id: string;
  courseId: string;
}>;

export type SectionRevision = Readonly<{
  id: string;
  sectionId: string;
  revisionNumber: number;
  schemaVersion: 1;
  publishedAt: string;
  title: LocalizedText;
  description: LocalizedText;
  questionRevisionIds: readonly string[];
}>;

export type QuestionIdentity = Readonly<{
  id: string;
  courseId: string;
  slug: string;
}>;

export type QuestionRevision = Readonly<{
  id: string;
  questionId: string;
  revisionNumber: number;
  schemaVersion: 1;
  publishedAt: string;
  difficulty: Difficulty;
  content: BilingualQuestionContent;
}>;

export type PublishedContentData = Readonly<{
  courses: readonly CourseIdentity[];
  courseRevisions: readonly CourseRevision[];
  sections: readonly SectionIdentity[];
  sectionRevisions: readonly SectionRevision[];
  questions: readonly QuestionIdentity[];
  questionRevisions: readonly QuestionRevision[];
}>;

export type CourseSummary = Readonly<{
  id: string;
  revisionId: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  sectionCount: number;
  questionCount: number;
}>;

export type QuestionSummary = Readonly<{
  id: string;
  revisionId: string;
  slug: string;
  order: number;
  difficulty: Difficulty;
  prompt: LocalizedText;
}>;

export type SectionOutline = Readonly<{
  id: string;
  revisionId: string;
  order: number;
  title: LocalizedText;
  description: LocalizedText;
  questions: readonly QuestionSummary[];
}>;

export type CourseOutline = Readonly<{
  id: string;
  revisionId: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  sections: readonly SectionOutline[];
  questionCount: number;
}>;

export type QuestionNavigationItem = Readonly<{
  slug: string;
  prompt: string;
}>;

export type PublishedQuestionLesson = Readonly<{
  course: Pick<CourseOutline, "id" | "slug" | "title">;
  sections: readonly SectionOutline[];
  section: Pick<SectionOutline, "id" | "title">;
  question: QuestionSummary;
  revision: QuestionRevision;
  questionNumber: number;
  questionCount: number;
  previous: QuestionNavigationItem | null;
  next: QuestionNavigationItem | null;
}>;

export type PublishedQuestionPath = Readonly<{
  courseSlug: string;
  questionSlug: string;
}>;
