import Link from "next/link";
import type { CourseSummary } from "../model";

function ArrowUpRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

export function CourseCatalog({
  courses,
}: {
  courses: readonly CourseSummary[];
}) {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-20 sm:px-10 sm:pb-24 sm:pt-28">
        <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.045em] text-ink sm:text-6xl lg:text-7xl">
          Learn the concept.
          <br />
          Answer with clarity.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
          Concise English answers for the interview, paired with independently
          authored Chinese explanations for real understanding.
        </p>
      </section>

      <section
        aria-labelledby="courses-heading"
        className="border-y border-line"
      >
        <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-10 sm:py-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2
                id="courses-heading"
                className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
              >
                Courses
              </h2>
              <p className="mt-2 text-muted">
                Follow a structured course, then practice it in your own words.
              </p>
            </div>
          </div>

          <div className="mt-10 divide-y divide-line border-y border-line">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group grid gap-7 py-8 outline-none transition-colors hover:bg-surface focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5"
              >
                <div>
                  <h3 className="text-3xl font-semibold tracking-tight text-ink">
                    {course.title.en}
                  </h3>
                  <p
                    lang="zh-Hans"
                    className="mt-1 text-sm font-medium text-teaching"
                  >
                    {course.title.zhHans}
                  </p>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                    {course.description.en}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-10 sm:justify-end">
                  <p className="font-mono text-sm text-muted">
                    {course.sectionCount} sections · {course.questionCount}{" "}
                    questions
                  </p>
                  <span className="grid size-11 place-items-center border border-line text-brand transition-colors group-hover:border-brand group-focus-visible:border-brand">
                    <ArrowUpRightIcon />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
