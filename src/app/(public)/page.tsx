import type { Metadata } from "next";
import { getPublishedCourse, listPublishedCourses } from "@/modules/content/public";
import { CourseCatalog } from "@/modules/content/ui/course-catalog";

export const metadata: Metadata = {
  title: "Learning",
  description: "Learn backend systems, Java, Spring, and React through bilingual explanations and interview practice.",
};

export default async function HomePage() {
  const courses = await listPublishedCourses();
  const outlines = await Promise.all(courses.map((course) => getPublishedCourse(course.slug)));
  const questions = outlines.flatMap((course) => course ? course.sections.flatMap((section) => section.questions.map((question) => ({ id: question.id, courseSlug: course.slug, slug: question.slug }))) : []);

  return <CourseCatalog courses={courses} questions={questions} />;
}
