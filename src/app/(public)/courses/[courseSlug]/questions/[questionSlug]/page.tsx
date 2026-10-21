import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublishedQuestion,
  listPublishedQuestionParams,
  QuestionLesson,
} from "@/modules/content";

export const dynamicParams = false;

export async function generateStaticParams() {
  return listPublishedQuestionParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string; questionSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug, questionSlug } = await params;
  const lesson = await getPublishedQuestion(courseSlug, questionSlug);

  if (!lesson) {
    return {};
  }

  return {
    title: lesson.revision.content.prompt.en,
    description: lesson.revision.content.englishInterviewAnswer.answer,
  };
}

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ courseSlug: string; questionSlug: string }>;
}) {
  const { courseSlug, questionSlug } = await params;
  const lesson = await getPublishedQuestion(courseSlug, questionSlug);

  if (!lesson) {
    notFound();
  }

  return <QuestionLesson lesson={lesson} />;
}
