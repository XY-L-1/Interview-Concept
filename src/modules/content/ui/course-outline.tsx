import type { CourseOutline as CourseOutlineModel } from "../model";
import { CourseOutlineClient } from "./course-outline-client";

export function CourseOutline({ course }: { course: CourseOutlineModel }) {
  return <CourseOutlineClient course={course} />;
}
