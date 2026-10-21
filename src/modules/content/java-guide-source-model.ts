import type { Difficulty, LocalizedText } from "./model";

export type JavaGuideBlock = Readonly<{
  labelZh: string;
  labelEn: string;
  zh: string;
  en: string;
}>;

export type JavaGuideQuestion = Readonly<{
  questionNumber: string;
  sourceLine: number;
  difficulty: Difficulty;
  prompt: LocalizedText;
  blocks: readonly JavaGuideBlock[];
}>;

export type JavaGuideModule = Readonly<{
  slug: string;
  sourceFile: string;
  sourceSha256: string;
  title: LocalizedText;
  questions: readonly JavaGuideQuestion[];
}>;
