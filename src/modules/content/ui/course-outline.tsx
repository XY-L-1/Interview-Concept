import Link from "next/link";
import type { CourseOutline as CourseOutlineModel } from "../model";

function ArrowRightIcon() {
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
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function CourseOutline({ course }: { course: CourseOutlineModel }) {
  const firstQuestion =
    course.sections.flatMap((section) => section.questions)[0] ?? null;
  const questionNumbers = new Map(
    course.sections
      .flatMap((section) => section.questions)
      .map((question, index) => [question.id, index + 1]),
  );

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-6xl px-6 pb-24 pt-14 sm:px-10 sm:pt-20"
    >
      <Link
        href="/"
        className="text-sm font-medium text-muted outline-none transition-colors hover:text-brand focus-visible:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4"
      >
        ← All courses
      </Link>

      <header className="mt-10 grid gap-8 border-b border-line pb-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <h1 className="text-5xl font-semibold tracking-[-0.045em] text-ink sm:text-7xl">
            {course.title.en}
          </h1>
          <p
            lang="zh-Hans"
            className="mt-3 text-lg font-medium text-teaching"
          >
            {course.title.zhHans}
          </p>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">
            {course.description.en}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <p className="font-mono text-sm text-muted">
            {course.sections.length} sections · {course.questionCount} questions
          </p>
          {firstQuestion ? (
            <Link
              href={`/courses/${course.slug}/questions/${firstQuestion.slug}`}
              className="inline-flex min-h-11 items-center gap-3 bg-brand px-5 py-3 text-sm font-semibold text-white outline-none transition-colors hover:bg-brand-strong focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Start course
              <ArrowRightIcon />
            </Link>
          ) : null}
        </div>
      </header>

      <div className="divide-y divide-line">
        {course.sections.map((section) => (
          <section
            key={section.id}
            aria-labelledby={`section-${section.id}`}
            className="grid gap-8 py-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16"
          >
            <div>
              <p className="font-mono text-sm text-brand">
                {String(section.order).padStart(2, "0")}
              </p>
              <h2
                id={`section-${section.id}`}
                className="mt-3 text-2xl font-semibold tracking-tight text-ink"
              >
                {section.title.en}
              </h2>
              <p
                lang="zh-Hans"
                className="mt-1 text-sm font-medium text-teaching"
              >
                {section.title.zhHans}
              </p>
              <p className="mt-4 text-sm leading-6 text-muted">
                {section.description.en}
              </p>
            </div>

            <ol className="divide-y divide-line border-y border-line">
              {section.questions.map((question) => {
                const questionNumber = questionNumbers.get(question.id);

                return (
                  <li key={question.id}>
                    <Link
                      href={`/courses/${course.slug}/questions/${question.slug}`}
                      className="group grid gap-4 py-5 outline-none transition-colors hover:bg-surface focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:items-center sm:px-4"
                    >
                      <span className="font-mono text-sm text-muted">
                        {String(questionNumber).padStart(2, "0")}
                      </span>
                      <span>
                        <span className="block font-medium leading-6 text-ink transition-colors group-hover:text-brand group-focus-visible:text-brand">
                          {question.prompt.en}
                        </span>
                        <span
                          lang="zh-Hans"
                          className="mt-1 block text-sm text-muted"
                        >
                          {question.prompt.zhHans}
                        </span>
                      </span>
                      <span className="flex items-center gap-4">
                        <span className="font-mono text-xs uppercase tracking-wide text-muted">
                          {question.difficulty}
                        </span>
                        <ArrowRightIcon />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </main>
  );
}
