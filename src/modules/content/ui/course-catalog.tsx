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
          Chinese explanations, speakable English answers, and the courses you
          can work through from fundamentals to interview practice.
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

          <Link href="/prepare/studio" className="mt-8 block rounded border border-line bg-surface p-6 outline-none hover:border-brand focus-visible:ring-2 focus-visible:ring-brand">
            <p className="font-mono text-xs text-brand">PRIVATE INTERVIEW STUDIO</p>
            <h3 className="mt-2 text-xl font-semibold text-ink">Simple AI · Stories &amp; Foundations →</h3>
            <p lang="zh-Hans" className="mt-3 text-sm leading-7 text-body">已有 31 道行为题、6 个故事和 94 道基础题（8 个模块）。在私密工作区导入本地资料，保留原 HTML 的计时、测验、笔记和进度导入导出。</p>
          </Link>

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
                    {course.sectionCount} {course.sectionCount === 1 ? "section" : "sections"} · {course.questionCount}{" "}
                    questions
                  </p>
                  <span className="grid size-11 place-items-center border border-line text-brand transition-colors group-hover:border-brand group-focus-visible:border-brand">
                    <ArrowUpRightIcon />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-sm leading-7 text-muted">项目本身怎样组织？阅读 <a className="text-brand underline underline-offset-4" href="/guides/architecture.html">历史架构教学 HTML</a>。其中路线图是当时的设计计划，当前功能以网站实际实现为准。</p>
        </div>
      </section>
    </main>
  );
}
