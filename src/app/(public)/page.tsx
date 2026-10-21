import { CourseCatalog, listPublishedCourses } from "@/modules/content";

export default async function HomePage() {
  const courses = await listPublishedCourses();

  return <CourseCatalog courses={courses} />;
}
