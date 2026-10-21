"use client";

import Link from "next/link";
import { useProgressSummary } from "@/modules/learning";
import { Icon } from "@/shared/ui/icons";
import type { CourseOutline } from "../model";
import { GuideText } from "./original-guide";

const statusLabels = { learning: "Learning", review: "To review", confident: "Confident" } as const;

export function CourseOutlineClient({ course }: { course: CourseOutline }) {
  const progress = useProgressSummary();
  const questions = course.sections.flatMap((section) => section.questions);
  const recorded = questions.filter((question) => progress.questions[question.id]);
  const mostRecent = [...recorded].sort((left, right) => Date.parse(progress.questions[right.id].updatedAt) - Date.parse(progress.questions[left.id].updatedAt))[0];
  const nextQuestion = mostRecent ?? questions[0];
  const confident = questions.filter((question) => progress.questions[question.id]?.status === "confident").length;
  const review = questions.filter((question) => progress.questions[question.id]?.status === "review").length;
  const loading = progress.authenticated && progress.syncState === "loading";
  const questionNumbers = new Map(questions.map((question, index) => [question.id, question.id.startsWith("question_java_") ? question.id.slice("question_java_".length) : String(index + 1).padStart(2, "0")]));

  return <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[1400px] px-5 pb-16 pt-7 sm:px-8 sm:pt-9">
    <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-brand focus-visible:outline-2 focus-visible:outline-brand"><Icon name="arrow-left" size={16} />All courses</Link>
    <header className="mt-4"><h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-[-0.035em] text-ink sm:text-4xl"><GuideText text={course.title.en} /></h1><p lang="zh-Hans" className="mt-3 text-base font-medium leading-7 text-teaching">{course.title.zhHans}</p><p className="mt-4 max-w-4xl text-base leading-7 text-muted">{course.description.en}</p></header>

    <section aria-labelledby="course-start-heading" className="mt-7 grid gap-6 rounded-2xl border border-line bg-white p-6 shadow-[0_2px_10px_#17223b03] md:grid-cols-[minmax(0,1fr)_auto] md:items-center sm:p-8">
      <div><h2 id="course-start-heading" className="text-xl font-semibold text-ink">{mostRecent ? "Pick up the next idea." : "Start with one clear concept."}</h2><p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{mostRecent ? <GuideText text={mostRecent.prompt.en} /> : "先理解机制，再动手探索，最后用自己的话解释。"}</p><p className="mt-3 text-xs text-muted">{course.sections.length} sections · {course.questionCount} questions{loading ? " · Loading saved progress…" : progress.authenticated ? ` · ${confident} self-marked confident · ${review} to review` : " · Sign in to save your place"}</p></div>
      {nextQuestion ? <Link href={`/courses/${course.slug}/questions/${nextQuestion.slug}`} className="inline-flex min-h-12 w-fit items-center justify-center gap-3 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">{mostRecent ? "Continue learning" : "Open first lesson"}<Icon name="arrow-right" size={18} /></Link> : null}
    </section>

    <div className="mt-9 space-y-9">{course.sections.map((section) => <section key={section.id} aria-labelledby={`section-${section.id}`}>
      <div className="mb-5 flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-sm font-semibold text-brand">{String(section.order).padStart(2, "0")}</span><div><h2 id={`section-${section.id}`} className="text-xl font-semibold tracking-tight text-ink">{section.title.en}</h2><p lang="zh-Hans" className="mt-1 text-sm leading-6 text-muted">{section.title.zhHans}</p><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{section.description.en}</p></div></div>
      <ol className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{section.questions.map((question) => {
        const status = progress.questions[question.id]?.status;
        return <li key={question.id} className="min-w-0"><Link href={`/courses/${course.slug}/questions/${question.slug}`} className="group flex h-full min-h-[190px] flex-col rounded-2xl border border-line bg-white p-5 shadow-[0_2px_10px_#17223b02] transition-colors hover:border-brand/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          <div className="flex items-center justify-between gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-surface font-mono text-xs font-medium text-body">{questionNumbers.get(question.id)}</span><span className={`rounded-md px-2 py-1 text-[11px] font-medium ${status === "confident" ? "bg-teaching-soft text-teaching" : status === "review" ? "bg-amber-50 text-amber-800" : status === "learning" ? "bg-brand/8 text-brand" : "text-muted"}`}>{status ? statusLabels[status] : "Not recorded"}</span></div>
          <h3 className="mt-4 text-[15px] font-semibold leading-6 text-ink group-hover:text-brand"><GuideText text={question.prompt.en} /></h3><p lang="zh-Hans" className="mt-2 text-sm leading-6 text-muted"><GuideText text={question.prompt.zhHans} /></p><div className="mt-auto flex items-center justify-between gap-3 pt-5"><span className="text-xs capitalize text-muted">{question.difficulty}</span><span className="inline-flex items-center gap-2 text-xs font-semibold text-brand">Open lesson<Icon name="arrow-right" size={16} /></span></div>
        </Link></li>;
      })}</ol>
    </section>)}</div>
    {progress.error ? <p role="alert" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-body">{progress.error}</p> : null}
  </main>;
}
