import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CourseOutline,
  getPublishedCourse,
  listPublishedCourseParams,
} from "@/modules/content";

export const dynamicParams = false;

export async function generateStaticParams() {
  return listPublishedCourseParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = await getPublishedCourse(courseSlug);

  if (!course) {
    return {};
  }

  return {
    title: course.title.en,
    description: course.description.en,
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const course = await getPublishedCourse(courseSlug);

  if (!course) {
    notFound();
  }

  return <CourseOutline course={course} />;
}
