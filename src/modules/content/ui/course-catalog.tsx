"use client";

import Link from "next/link";
import { useState } from "react";
import { useProgressSummary } from "@/modules/learning/provider";
import { Icon } from "@/shared/ui/icons";
import type { CourseSummary } from "../model";
import "./catalog.css";

export type CatalogQuestion = { id: string; courseSlug: string; slug: string };
type Category = "All courses" | "Backend" | "Java & Spring" | "React";

const presentation: Record<string, { title: string; description: string; category: Category; order: number }> = {
  "java-backend-review": { title: "JD Core Review", description: "逐项覆盖 Java、MySQL、Redis、RPC、系统设计、可靠性与支付。", category: "Backend", order: -1 },
  "backend-systems": { title: "Backend Systems", description: "Follow a request through services, queues, failures, and system capacity.", category: "Backend", order: 0 },
  "java-language": { title: "Java Language & OOP", description: "Learn core Java syntax and the principles of object-oriented programming.", category: "Java & Spring", order: 1 },
  "java-collections-generics-streams": { title: "Collections & Streams", description: "Work with collections, generics, and streams to organize and process data.", category: "Java & Spring", order: 2 },
  "java-jvm": { title: "JVM & Garbage Collection", description: "Explore how the JVM loads your code and manages memory.", category: "Java & Spring", order: 3 },
  "java-concurrency": { title: "Java Concurrency", description: "Understand threads, shared state, and the Java memory model.", category: "Java & Spring", order: 4 },
  "spring-core": { title: "Spring Core", description: "Understand dependency injection, application context, and AOP.", category: "Java & Spring", order: 5 },
  "spring-boot-web": { title: "Spring Boot & Web", description: "Connect configuration, HTTP requests, and Spring web applications.", category: "Java & Spring", order: 6 },
  "spring-data-transactions-cache": { title: "Transactions & Caching", description: "Reason about data access, transaction boundaries, and cache behavior.", category: "Java & Spring", order: 7 },
  "spring-production": { title: "Production Engineering", description: "Prepare applications with testing, security, and production checks.", category: "Java & Spring", order: 8 },
  react: { title: "React", description: "Explain rendering, component data flow, and everyday React patterns.", category: "React", order: 9 },
};

function Database({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}><ellipse cx="22" cy="9" rx="21" ry="8" fill="#f7f9ff" /><path d="M1 9v35c0 5 9 9 21 9s21-4 21-9V9M1 21c0 5 9 9 21 9s21-4 21-9M1 33c0 5 9 9 21 9s21-4 21-9" /></g>;
}

function Servers({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x} ${y})`}>{[0, 24].map((row) => <g key={row}><rect x="0" y={row} width="58" height="18" rx="3" fill="#e2f5ef" /><circle cx="8" cy={row + 9} r="2" /><circle cx="17" cy={row + 9} r="2" /><path d={`M29 ${row + 9}h19`} /></g>)}</g>;
}

function DiagramArrow({ x = 76, y = 42, width = 39 }: { x?: number; y?: number; width?: number }) {
  return <path d={`M${x} ${y}h${width}m-6-5 6 5-6 5`} />;
}

function CourseArt({ slug }: { slug: string }) {
  let art;
  switch (slug) {
    case "java-backend-review":
    case "backend-systems": art = <><Servers x={9} y={16} /><DiagramArrow /><Database x={128} y={9} /></>; break;
    case "java-language": art = <><path d="M14 10h31l14 14v45H14ZM45 10v15h14M24 35h24M24 44h20M24 53h15" /><g stroke="#6389e6"><path d="M98 45h35c0 15-4 19-17 19s-18-4-18-19Zm35 2h6c12 0 7 12-7 12M91 70c15 7 36 7 50-1M114 34c-14-12 18-12 5-27M122 38c-8-10 18-12 11-25" /></g></>; break;
    case "java-collections-generics-streams": art = <><rect x="7" y="13" width="38" height="22" rx="3" fill="#e2f5ef" /><rect x="65" y="40" width="38" height="22" rx="3" fill="#e2f5ef" /><path d="M45 24h41v10M25 36v13h33m-5-5 5 5-5 5M108 50l28-14m-7-1 7 1-3 7" stroke="#8498e1" /><rect x="145" y="8" width="48" height="62" rx="5" /><path d="M154 21h7m9 0h14m-30 12h7m9 0h14m-30 12h7m9 0h14m-30 12h7m9 0h14" /></>; break;
    case "java-jvm": art = <><rect x="10" y="11" width="61" height="58" rx="4" fill="#f7faff" /><path d="M10 23h61" /><circle cx="61" cy="17" r="1" /><text x="21" y="51" stroke="none" fill="#4c658f" fontSize="18" fontWeight="500">JVM</text><DiagramArrow x={82} y={41} width={40} /><path d="M131 22h53m-47 0 4 47h34l4-47M147 22v-9h20v9M149 32v25m9-25v25m9-25v25" stroke="#3973a6" /></>; break;
    case "java-concurrency": art = <><path d="M20 6v34m-6-6 6 6 6-6M20 51v18M48 6v15m0 26v22M62 15h32m-6-5 6 5-6 5M62 39h32m-6-5 6 5-6 5M62 63h32m-6-5 6 5-6 5" /><rect x="11" y="50" width="18" height="18" rx="2" fill="#e5efff" /><rect x="40" y="29" width="16" height="16" rx="4" fill="#e2f5ef" />{[6, 30, 54].map((y) => <rect key={y} x="105" y={y} width="18" height="18" rx="2" fill="#f5f7ff" />)}</>; break;
    case "spring-core": art = <><path d="M15 64C-2 30 25 17 61 9c4 30-3 58-31 55-7 0-11-2-15-5M8 73c6-22 28-26 43-47" fill="#e2f5ef" stroke="#38809c" /><DiagramArrow x={77} width={39} /><Servers x={129} y={16} /></>; break;
    case "spring-boot-web": art = <><rect x="7" y="9" width="76" height="58" rx="5" fill="#f8faff" /><path d="M7 22h76M17 15h2m5 0h2m5 0h2M30 35l-9 9 9 9m29-18 9 9-9 9m-14-23-7 27" /><DiagramArrow x={94} width={28} /><rect x="135" y="18" width="48" height="41" rx="5" fill="#e2f5ef" /><path d="M146 30h26m-26 9h18m-18 9h22" /></>; break;
    case "spring-data-transactions-cache": art = <><Database x={10} y={10} /><path d="M68 29h48m-6-5 6 5-6 5M116 54H68m6-5-6 5 6 5" stroke="#8498e1" /><path d="M148 12l28 10v22c0 15-15 23-28 28-13-5-27-13-27-28V22Z" fill="#e2f5ef" /><path d="m135 41 10 10 18-22" /></>; break;
    case "spring-production": art = <><rect x="9" y="12" width="57" height="57" rx="5" fill="#f8faff" /><path d="m19 29 4 4 8-9m6 5h18M19 45h8m10 0h18m-36 13h8m10 0h18" /><DiagramArrow x={78} width={32} /><path d="M127 66V13m0 53h61m-54-13 14-18 14 9 20-25" stroke="#38809c" /><path d="M174 19h8v8" /></>; break;
    default: art = <><g transform="translate(44 40)" stroke="#5895c2"><ellipse rx="36" ry="13" /><ellipse rx="36" ry="13" transform="rotate(60)" /><ellipse rx="36" ry="13" transform="rotate(120)" /><circle r="4" fill="#dff2f7" /></g><DiagramArrow x={90} width={24} /><rect x="129" y="13" width="61" height="54" rx="5" fill="#f7f9ff" /><path d="M129 25h61M139 36h17m-17 10h39m-39 10h25" /></>;
  }
  return <svg aria-hidden="true" className="catalog-course-art" viewBox="0 0 210 80" fill="none" stroke="#4c658f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{art}</svg>;
}

function PipelineArt() {
  return <svg aria-hidden="true" className="catalog-pipeline" viewBox="0 0 480 123" fill="none" stroke="#3e5f86" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
    {[0, 181, 362].map((x) => <rect key={x} x={x + 1} y="1" width="116" height="100" rx="13" fill="#e3f4ee" stroke="none" />)}
    <path d="M46 22h18l10 10v34H46ZM64 22v11h10M53 42h14m-14 8h14m-14 8h10" />
    <path d="M235 23h10l2 7 6 3 7-2 5 9-5 5v7l5 5-5 9-7-2-6 3-2 7h-10l-2-7-6-3-7 2-5-9 5-5v-7l-5-5 5-9 7 2 6-3Zm-5 25a10 10 0 1 0 20 0 10 10 0 0 0-20 0Z" transform="translate(0 -5) scale(1 .9)" />
    <g transform="translate(400 23)"><ellipse cx="20" cy="7" rx="15" ry="6" /><path d="M5 7v24c0 4 7 7 15 7s15-3 15-7V7M5 19c0 4 7 7 15 7s15-3 15-7" /></g>
    <DiagramArrow x={123} y={49} width={50} /><DiagramArrow x={304} y={49} width={50} />
    <g fill="#34415f" stroke="none" fontSize="13" textAnchor="middle"><text x="59" y="86">Request</text><text x="240" y="86">Worker</text><text x="420" y="86">Result</text></g>
  </svg>;
}

export function CourseCatalog({ courses, questions }: { courses: readonly CourseSummary[]; questions: readonly CatalogQuestion[] }) {
  const [category, setCategory] = useState<Category>("All courses");
  const [showAll, setShowAll] = useState(false);
  const progress = useProgressSummary();
  const ordered = courses.toSorted((a, b) => (presentation[a.slug]?.order ?? 99) - (presentation[b.slug]?.order ?? 99));
  const filtered = ordered.filter((course) => category === "All courses" || presentation[course.slug]?.category === category);
  const displayed = category === "All courses" && !showAll ? filtered.slice(0, 6) : filtered;
  const latest = questions.reduce<CatalogQuestion | null>((recent, question) => {
    const state = progress.questions[question.id];
    if (!state) return recent;
    return !recent || Date.parse(state.updatedAt) > Date.parse(progress.questions[recent.id].updatedAt) ? question : recent;
  }, null);
  const current = (latest && courses.find((course) => course.slug === latest.courseSlug)) || ordered[0];
  const currentTitle = current ? presentation[current.slug]?.title ?? current.title.en : "the learning library";
  const confident = current ? questions.filter((question) => question.courseSlug === current.slug && progress.questions[question.id]?.status === "confident").length : 0;
  const questionCount = courses.reduce((total, course) => total + course.questionCount, 0);
  const href = latest ? `/courses/${latest.courseSlug}/questions/${latest.slug}` : current ? `/courses/${current.slug}` : "/";

  return <main id="main-content" tabIndex={-1} className="catalog-page ui-page">
    <header className="catalog-hero"><h1>What will you understand next?</h1><p>Build the concept. Explore the system. Explain it clearly.</p></header>
    <Link href="/review" className="ui-card mb-5 flex flex-wrap items-center justify-between gap-3 p-5 text-brand"><span><strong>按 JD 复习 · 12 个技术方向</strong><span className="mt-1 block text-sm text-muted">从基础到支付：27 节核心课、中文讲解、英文回答与自测。无需登录即可学习。</span></span><Icon name="arrow-right" size={23} /></Link>
    <section className="catalog-continue ui-card" aria-labelledby="continue-heading">
      <div className="catalog-continue-copy"><h2 id="continue-heading">Continue learning</h2><p>{latest ? "Pick up with the lesson you most recently practiced." : "Start with a request. Follow it through the system."}</p><Link href={href} className="ui-button ui-button-primary">{latest ? "Continue lesson" : `Open ${currentTitle}`}<Icon name="arrow-right" size={17} /></Link></div>
      <div className="catalog-continue-diagram"><PipelineArt /><div className="catalog-progress" role="status">{!progress.authenticated ? <Link href="/login">Sign in to save your place</Link> : progress.syncState === "loading" ? <span>Loading your progress…</span> : progress.error ? <button type="button" onClick={progress.retry}>Progress unavailable · Retry</button> : <><span>{latest ? currentTitle : "No progress recorded yet"}</span><strong>{confident} / {current?.questionCount ?? 0} confident</strong></>}</div></div>
    </section>
    <section className="catalog-explore" aria-labelledby="courses-heading"><h2 id="courses-heading">Explore the courses</h2><p className="catalog-totals">{courses.length} courses · {questionCount} questions</p>
      <div className="catalog-filters" role="group" aria-label="Filter courses">{(["All courses", "Backend", "Java & Spring", "React"] as const).map((filter) => <button key={filter} type="button" aria-pressed={category === filter} className={category === filter ? "catalog-filter is-active" : "catalog-filter"} onClick={() => { setCategory(filter); setShowAll(false); }}>{filter}</button>)}</div>
      <div className="catalog-grid">{displayed.map((course) => {
        const info = presentation[course.slug];
        return <Link key={course.id} href={`/courses/${course.slug}`} className="catalog-course ui-card"><CourseArt slug={course.slug} /><h3>{info?.title ?? course.title.en}</h3><p>{info?.description ?? course.description.en}</p><div className="catalog-course-footer"><span>{course.questionCount} questions</span><span className="catalog-open">Open course <Icon name="arrow-right" size={17} /></span></div></Link>;
      })}</div>
      {category === "All courses" && !showAll && filtered.length > displayed.length ? <div className="catalog-view-all"><button className="ui-button ui-button-secondary" type="button" onClick={() => setShowAll(true)}>View all {courses.length} courses <Icon name="arrow-right" size={17} /></button></div> : null}
    </section>
  </main>;
}
