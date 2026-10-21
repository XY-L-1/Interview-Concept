"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useLearningProgress, useProgressSummary, type LearningStatus } from "@/modules/learning";
import { Icon } from "@/shared/ui/icons";
import type { PublishedQuestionLesson } from "../model";
import { BacklogExplorer } from "./backlog-explorer";
import { KafkaExplorer } from "./kafka-explorer";
import { ConceptDiagram } from "./concept-diagram";
import type { ConceptPrimer } from "../concept-primers";
import { GuideText } from "./original-guide";

type Mode = "understand" | "explore" | "recall" | "english";
const modes = [
  { id: "understand", label: "Understand", icon: "book" },
  { id: "explore", label: "Explore", icon: "branch" },
  { id: "recall", label: "Recall", icon: "layers" },
  { id: "english", label: "Speak English", icon: "message" },
] as const;
const backendTitles: Record<string, string> = {
  "request-and-async-translation": "Requests & async work",
  "why-and-when-kafka": "Why Kafka?",
  "kafka-topics-partitions-groups-offsets": "Topics & consumer groups",
  "duplicate-delivery-and-idempotency": "Failure & idempotency",
  "kafka-ordering-and-parallelism": "Ordering & parallelism",
  "concurrency-throughput-latency": "Concurrency & latency",
  "backlog-and-bottlenecks": "Backlogs & bottlenecks",
  "payment-timeouts-and-unknown-results": "Payment timeouts",
};
const noSubscription = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function Curriculum({ lesson }: { lesson: PublishedQuestionLesson }) {
  const progress = useProgressSummary();
  const questions = lesson.sections.flatMap((section) => section.questions);
  return <div className="border-t border-line pt-5">
    <Link href={`/courses/${lesson.course.slug}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-brand focus-visible:outline-2 focus-visible:outline-brand"><Icon name="arrow-left" size={16} />Course overview</Link>
    <h2 className="mt-3 px-2 text-sm font-semibold leading-6 text-ink">{lesson.course.title.en}</h2>
    <nav aria-label="Course curriculum" className="mt-3 max-h-[calc(100svh-22rem)] space-y-1 overflow-y-auto pr-1">
      {questions.map((question, index) => {
        const current = question.id === lesson.question.id;
        const status = progress.questions[question.id]?.status;
        return <Link key={question.id} href={`/courses/${lesson.course.slug}/questions/${question.slug}`} aria-current={current ? "page" : undefined} className={`flex min-h-12 items-start gap-2.5 rounded-xl px-2 py-3 text-[13px] leading-5 transition-colors focus-visible:outline-2 focus-visible:outline-brand ${current ? "bg-brand/8 font-semibold text-brand" : "text-muted hover:bg-surface hover:text-ink"}`}>
          <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${current ? "bg-brand text-white" : status === "confident" ? "bg-teaching-soft text-teaching" : "bg-surface text-body"}`}>{status === "confident" ? <Icon name="check" size={13} /> : index + 1}</span>
          <span className="min-w-0"><GuideText text={lesson.course.slug === "backend-systems" ? backendTitles[question.slug] ?? question.prompt.en : question.prompt.en} />{status && status !== "confident" ? <span className="mt-1 block text-[10px] font-normal text-muted">{status === "review" ? "To review" : "Learning"}</span> : null}</span>
        </Link>;
      })}
    </nav>
    <p className="mt-4 px-2 text-xs text-muted">Lesson {lesson.questionNumber} of {lesson.questionCount}</p>
  </div>;
}

function RecallCard({ question, answer }: { question: string; answer: string }) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const [revealed, setRevealed] = useState(false);
  return <section className="rounded-2xl border border-line bg-white p-6">
    <h3 id={`${id}-question`} className="font-semibold leading-7 text-ink"><GuideText text={question} /></h3>
    <label htmlFor={`${id}-draft`} className="mt-5 block text-sm font-medium text-body">先用自己的话回答</label>
    <textarea id={`${id}-draft`} aria-describedby={`${id}-draft-note`} rows={4} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="我的判断是……因为……如果条件改变……" className="mt-2 w-full resize-y rounded-xl border border-line bg-white p-4 text-[15px] leading-7 text-body outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" />
    <p id={`${id}-draft-note`} className="mt-2 text-xs text-muted">本页草稿；下方的学习状态可保存到账号。</p>
    <button type="button" aria-expanded={revealed} aria-controls={`${id}-answer`} onClick={() => setRevealed((value) => !value)} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-brand hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand"><Icon name={revealed ? "close" : "check"} size={16} />{revealed ? "收起参考解释" : "回答后，展开解释"}</button>
    {revealed ? <div id={`${id}-answer`} className="mt-4 rounded-xl bg-teaching-soft p-5"><h4 className="font-semibold text-teaching">对照原因与边界</h4><p className="mt-2 whitespace-pre-wrap text-[15px] leading-8 text-body"><GuideText text={answer} /></p><fieldset className="mt-5 border-t border-teaching/15 pt-4"><legend className="px-1 text-xs font-medium text-teaching">自检 · 由你判断</legend><div className="mt-2 flex flex-wrap gap-x-5 gap-y-3 text-sm text-body">{["能解释原因", "能给出例子", "能指出边界"].map((label) => <label key={label} className="flex items-center gap-2"><input type="checkbox" className="size-4 accent-brand" />{label}</label>)}</div></fieldset></div> : null}
  </section>;
}

function SpeakingTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running || seconds >= 90) return;
    const timer = setInterval(() => setSeconds((value) => Math.min(value + 1, 90)), 1000);
    return () => clearInterval(timer);
  }, [running, seconds]);
  return <div className="rounded-2xl border border-line bg-white p-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-semibold text-ink">Explain it in your own words</h2><p className="mt-1 text-sm text-muted">60–90 seconds · 自己判断表达是否清楚</p></div><span aria-label={`${seconds} seconds elapsed`} className="font-mono text-3xl tracking-tight text-brand">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span></div>
    <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => { if (seconds >= 90) { setSeconds(0); setRunning(true); } else setRunning((value) => !value); }} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"><Icon name={running && seconds < 90 ? "pause" : "play"} size={16} />{running && seconds < 90 ? "Pause" : seconds >= 90 ? "Try again" : "Start practice"}</button><button type="button" onClick={() => { setRunning(false); setSeconds(0); }} className="min-h-11 rounded-lg border border-line px-4 py-2 text-sm text-body hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand">Reset timer</button></div>
    {seconds >= 90 ? <p role="status" className="mt-3 text-sm text-teaching">时间到了。检查：先给结论了吗？原因、例子和边界清楚吗？</p> : null}
  </div>;
}

export function LessonExperience({ lesson, primer, understand, english, examples }: { lesson: PublishedQuestionLesson; primer?: ConceptPrimer; understand: ReactNode; english: ReactNode; examples: ReactNode }) {
  const [mode, setMode] = useState<Mode>("understand");
  const hydrated = useSyncExternalStore(noSubscription, clientSnapshot, serverSnapshot);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const progress = useLearningProgress(lesson.question.id);
  const { authenticated, syncState, status, setStatus } = progress;
  const { content } = lesson.revision;
  const isBackend = lesson.course.slug === "backend-systems";
  const isCapacity = ["concurrency-throughput-latency", "backlog-and-bottlenecks"].includes(lesson.question.slug);
  const navigationSlot = hydrated ? document.getElementById("course-navigation-slot") : null;
  const statusUnavailable = !progress.authenticated || ["loading", "error", "conflict"].includes(progress.syncState);
  const recall = !content.originalGuide && content.practice?.length ? content.practice : [{ question: content.prompt.zhHans, answer: content.originalGuide?.blocks[0].zh ?? content.chineseDeepDive.interviewSummary }];

  useEffect(() => {
    if (authenticated && syncState === "saved" && status === null) setStatus("learning");
  }, [authenticated, syncState, status, setStatus]);

  return <main id="main-content" tabIndex={-1} className="mx-auto w-full min-w-0 max-w-[1500px] px-5 pb-12 pt-6 sm:px-8 sm:pt-8">
    {navigationSlot ? createPortal(<Curriculum lesson={lesson} />, navigationSlot) : null}
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="flex items-center gap-2 text-sm text-muted"><Link href="/" className="rounded hover:text-brand focus-visible:outline-2 focus-visible:outline-brand">Learning</Link><span aria-hidden="true">/</span><Link href={`/courses/${lesson.course.slug}`} className="rounded hover:text-brand focus-visible:outline-2 focus-visible:outline-brand">{lesson.course.title.en}</Link></p><div className="flex rounded-lg border border-line bg-white p-1"><button type="button" onClick={() => setMode("understand")} className={`min-h-9 rounded-md px-3 text-xs font-medium focus-visible:outline-2 focus-visible:outline-brand ${mode === "understand" ? "bg-brand/8 text-brand" : "text-muted"}`}>中文深讲</button><button type="button" onClick={() => setMode("english")} className={`min-h-9 rounded-md px-3 text-xs font-medium focus-visible:outline-2 focus-visible:outline-brand ${mode === "english" ? "bg-brand/8 text-brand" : "text-muted"}`}>English</button></div></div>
    <header><h1 className="max-w-5xl text-3xl font-bold leading-[1.17] tracking-[-0.035em] text-ink sm:text-[2.5rem]"><GuideText text={isBackend ? backendTitles[lesson.question.slug] ?? content.prompt.en : content.prompt.en} /></h1><p lang="zh-Hans" className="mt-3 max-w-4xl text-[16px] leading-7 text-muted"><GuideText text={content.prompt.zhHans} /></p></header>
    <details className="mt-5 rounded-xl border border-line bg-white p-4 lg:hidden"><summary className="cursor-pointer text-sm font-semibold text-ink">Course curriculum · {lesson.questionNumber} / {lesson.questionCount}</summary><Curriculum lesson={lesson} /></details>
    <div role="tablist" aria-label="Learning modes" className="mt-6 grid grid-cols-4 overflow-hidden rounded-xl border border-line bg-white">
      {modes.map((item, index) => <button key={item.id} ref={(element) => { tabRefs.current[index] = element; }} id={`lesson-tab-${item.id}`} type="button" role="tab" aria-selected={mode === item.id} aria-controls={`lesson-panel-${item.id}`} tabIndex={mode === item.id ? 0 : -1} onClick={() => setMode(item.id)} onKeyDown={(event) => { const target = event.key === "ArrowRight" ? (index + 1) % modes.length : event.key === "ArrowLeft" ? (index + modes.length - 1) % modes.length : event.key === "Home" ? 0 : event.key === "End" ? modes.length - 1 : -1; if (target >= 0) { event.preventDefault(); setMode(modes[target].id); tabRefs.current[target]?.focus(); } }} className={`flex min-h-14 items-center justify-center gap-2 border-b-2 px-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-brand sm:text-sm ${mode === item.id ? "border-brand bg-brand/6 text-brand" : "border-transparent text-muted hover:bg-surface"}`}><Icon name={item.icon} size={18} className="hidden sm:block" />{item.label}</button>)}
    </div>

    <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_250px]">
      <div className="min-w-0 space-y-5">
        <div id="lesson-panel-understand" role="tabpanel" aria-labelledby="lesson-tab-understand" tabIndex={0} hidden={mode !== "understand"}><div className="space-y-5">{primer ? <ConceptDiagram primer={primer} /> : null}{understand}</div></div>
        <div id="lesson-panel-explore" role="tabpanel" aria-labelledby="lesson-tab-explore" tabIndex={0} hidden={mode !== "explore"}>
          {isBackend ? isCapacity ? <div className="[&>section]:mt-0 [&>section]:max-w-none [&>section]:rounded-2xl [&>section]:bg-white"><BacklogExplorer /></div> : <KafkaExplorer /> : <section className="rounded-2xl border border-line bg-white p-6"><h2 className="text-xl font-semibold text-ink">改变一个条件，预测会发生什么</h2><p className="mt-3 text-sm leading-7 text-muted">从原文示例或追问中选一个条件，先写出预测，再回到 Understand 核对机制与边界。</p>{content.originalGuide ? <div className="mt-4 rounded-xl bg-surface p-5"><h3 className="font-semibold text-ink">{content.originalGuide.blocks[2].labelZh}</h3><p className="mt-2 text-[15px] leading-8 text-body"><GuideText text={content.originalGuide.blocks[2].zh} /></p></div> : examples}<label htmlFor="explore-prediction" className="mt-5 block text-sm font-semibold text-ink">我的假设与预测（本页草稿）</label><textarea id="explore-prediction" rows={5} placeholder="如果把……改成……，我预计……，因为……" className="mt-2 w-full rounded-xl border border-line p-4 text-[15px] leading-7 text-body outline-none focus:border-brand focus:ring-2 focus:ring-brand/10" /></section>}
        </div>
        <div id="lesson-panel-recall" role="tabpanel" aria-labelledby="lesson-tab-recall" tabIndex={0} hidden={mode !== "recall"}><h2 id={content.originalGuide ? undefined : "practice-heading"} className="mb-4 text-xl font-semibold text-ink">Predict first · 先想，再看解释</h2><div className="space-y-4">{recall.map((item) => <RecallCard key={item.question} {...item} />)}</div></div>
        <div id="lesson-panel-english" role="tabpanel" aria-labelledby="lesson-tab-english" tabIndex={0} hidden={mode !== "english"} className="space-y-5">{primer ? <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6"><h2 className="text-sm font-semibold text-brand">Start with one sentence</h2><p lang="en" className="mt-3 text-lg leading-8 text-ink">{primer.en}</p><p className="mt-2 text-sm leading-7 text-muted">{primer.zh}</p></div> : null}{mode === "english" ? <SpeakingTimer /> : null}{english}</div>
      </div>
      <aside className="space-y-5 self-start">
        <section className="rounded-2xl border border-line bg-white p-5"><div className="rounded-xl bg-teaching-soft p-4"><h2 className="flex items-center gap-2 font-semibold text-ink"><Icon name="layers" size={20} className="text-teaching" />Key idea</h2><p className="mt-3 text-sm leading-7 text-body"><GuideText text={primer?.zh ?? content.originalGuide?.blocks[0].zh ?? content.chineseDeepDive.interviewSummary} /></p></div></section>
        <section className="rounded-2xl border border-line bg-white p-5"><h2 className="flex items-center gap-2 font-semibold text-ink"><Icon name="message" size={20} className="text-brand" />Explain it in English</h2><p className="mt-3 text-sm leading-7 text-muted">用自己的话说明概念、原因、例子与边界。</p><button type="button" onClick={() => setMode("english")} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"><Icon name="play" size={16} />Start speaking practice</button></section>
      </aside>
    </div>

    <section aria-labelledby="learning-status-heading" className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="learning-status-heading" className="font-semibold text-ink">My understanding · 自己判断学习状态</h2><p className="mt-1 text-sm leading-6 text-muted">能否独立解释，比读完答案更重要。</p></div><p role="status" className="inline-flex items-center gap-2 text-xs text-muted"><Icon name="cloud" size={15} />{progress.syncState === "saved" ? progress.status ? "Saved to your account" : "Account progress ready" : progress.syncState === "saving" ? "Saving…" : progress.syncState === "loading" ? "Loading progress…" : progress.syncState === "guest" ? "Sign in to save" : "Changes need attention"}</p></div><div className="mt-4 flex flex-wrap gap-3">{([{ value: "learning", label: "Learning · 学习中" }, { value: "review", label: "Review · 需要回顾" }, { value: "confident", label: "Confident · 能独立解释" }] as const).map((item: { value: LearningStatus; label: string }) => <button key={item.value} type="button" disabled={statusUnavailable} aria-pressed={progress.status === item.value} onClick={() => progress.setStatus(item.value)} className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-brand ${progress.status === item.value ? "border-brand bg-brand/8 text-brand" : "border-line text-body hover:bg-surface"}`}>{progress.status === item.value ? <Icon name="check" size={15} /> : null}{item.label}</button>)}</div>
      {!progress.authenticated ? <p className="mt-4 text-sm leading-6 text-muted"><Link href={`/login?next=${encodeURIComponent(`/courses/${lesson.course.slug}/questions/${lesson.question.slug}`)}`} className="font-semibold text-brand underline underline-offset-4">登录账号</Link>，跨设备保存学习状态。课程与本页交互可以直接使用。</p> : null}
      {progress.error ? <div role="alert" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-body"><p>{progress.error}</p>{progress.syncState === "conflict" ? <div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={() => progress.resolveConflict("local")} className="min-h-10 rounded border border-line bg-white px-3 text-brand">保留本页版本</button><button type="button" onClick={() => progress.resolveConflict("remote")} className="min-h-10 rounded border border-line bg-white px-3 text-brand">使用云端冲突项</button></div> : <button type="button" onClick={progress.retry} className="mt-3 min-h-10 rounded border border-line bg-white px-3 font-medium text-brand">重试同步</button>}</div> : null}
    </section>

    {content.sources?.length ? <section aria-labelledby="sources-heading" className="mt-6 rounded-2xl border border-line bg-white p-6"><h2 id="sources-heading" className="font-semibold text-ink">官方资料 · 继续阅读</h2><ul className="mt-3 space-y-2 text-sm leading-6">{content.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer" className="break-words text-brand underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-brand">{source.title}</a></li>)}</ul></section> : null}
    <nav aria-label="Question navigation" className="mt-7 flex flex-wrap justify-between gap-4 border-t border-line pt-5">{lesson.previous ? <Link href={`/courses/${lesson.course.slug}/questions/${lesson.previous.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-brand focus-visible:outline-2 focus-visible:outline-brand"><Icon name="arrow-left" size={16} />Previous concept</Link> : <Link href={`/courses/${lesson.course.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm text-brand">Course overview</Link>}{lesson.next ? <Link href={`/courses/${lesson.course.slug}/questions/${lesson.next.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">Next concept<Icon name="arrow-right" size={16} /></Link> : <Link href={`/courses/${lesson.course.slug}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Back to course<Icon name="check" size={16} /></Link>}</nav>
  </main>;
}
