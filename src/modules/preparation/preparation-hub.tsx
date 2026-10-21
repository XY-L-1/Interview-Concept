"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/shared/ui/icons";
import { validateWorkspace, type PreparationWorkspace, type RoleContext } from "./model";
import { parseStudioBundle, type StudioBundle } from "./studio-model";
import { roleTemplates } from "./roles";
import { usePrivateDocument } from "./use-private-document";

function parseProfile(value: unknown): PreparationWorkspace {
  const result = validateWorkspace(value);
  if (!result.ok) throw new Error("个人资料格式不匹配；原记录未被覆盖。");
  return result.value;
}
function parseStudio(value: unknown): StudioBundle {
  return parseStudioBundle(JSON.stringify(value));
}

type Story = {
  id: string; title: string; subtitle?: string; summary?: string;
  readiness: "ready" | "needs-details";
  star: Record<"s" | "t" | "a" | "r", string>;
  spoken: string; guardrails?: string[]; missingFacts?: string[];
};
const tabs = [{ id: "s", label: "Situation" }, { id: "t", label: "Task" }, { id: "a", label: "Action" }, { id: "r", label: "Result" }, { id: "spoken", label: "English" }] as const;
type StoryTab = (typeof tabs)[number]["id"];
const storyIcons = ["branch", "code", "file", "message", "book", "layers"] as const;

function Status({ ready }: { ready: boolean }) {
  return <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium ${ready ? "border-[#d8e9e2] bg-[#eff7f3] text-[#477b64]" : "border-[#eee2ca] bg-[#fbf6ec] text-[#916d31]"}`}>
    <span aria-hidden="true" className={`size-2 rounded-full ${ready ? "bg-[#72a88f]" : "bg-[#eab24b]"}`} />{ready ? "可练口述" : "待补事实"}
  </span>;
}
function tabKeys(event: KeyboardEvent<HTMLButtonElement>) {
  const buttons = [...(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [])];
  const current = buttons.indexOf(event.currentTarget);
  const next = event.key === "ArrowRight" ? (current + 1) % buttons.length : event.key === "ArrowLeft" ? (current + buttons.length - 1) % buttons.length : event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : -1;
  if (next >= 0) { event.preventDefault(); buttons[next].click(); buttons[next].focus(); }
}

export function PreparationHub() {
  const profile = usePrivateDocument("profile", parseProfile);
  const studio = usePrivateDocument("studio", parseStudio);
  const [roleDraft, setRoleDraft] = useState<RoleContext | null>(null);
  const [studioDraft, setStudioDraft] = useState<StudioBundle | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [tab, setTab] = useState<StoryTab>("a");
  const [notice, setNotice] = useState("");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const started = useRef(0);
  const context = roleDraft ?? profile.document?.context;
  const bundle = studioDraft ?? studio.document;
  const stories = (bundle?.behavior.stories ?? []) as unknown as Story[];
  const selected = stories.find((story) => story.id === selectedId) ?? stories[0];
  const activeText = selected ? tab === "spoken" ? selected.spoken : selected.star[tab] : "";

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 250);
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (!studioDraft && !roleDraft) return;
    const leaving = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", leaving);
    return () => window.removeEventListener("beforeunload", leaving);
  }, [studioDraft, roleDraft]);

  function editStory(text: string) {
    if (!bundle || !selected) return;
    setStudioDraft({ ...bundle, behavior: { ...bundle.behavior, stories: bundle.behavior.stories.map((story) => story.id === selected.id
      ? tab === "spoken" ? { ...story, spoken: text } : { ...story, star: { ...(story.star as Story["star"]), [tab]: text } }
      : story) } });
  }
  function selectRole(company: "Temu" | "Simple AI") {
    if (!context) return;
    setRoleDraft({ ...context, company, focus: company === "Temu" ? "payments-java" : "applied-ai" });
  }
  function startPractice() {
    setTab("spoken");
    started.current = Date.now() - elapsed * 1000;
    setRunning(true);
  }
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");

  return <main id="main-content" tabIndex={-1} className="ui-page">
    <header className="flex flex-wrap items-start justify-between gap-5">
      <div><h1 className="ui-page-title">Prepare your next conversation.</h1><p className="ui-page-subtitle">Connect evidence, context, and a clear explanation.</p></div>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <span className="text-xs font-semibold text-muted">Role context</span>
        <div className="inline-flex rounded-[10px] border border-line bg-white p-1" role="group" aria-label="Role context">
          {(["Temu", "Simple AI"] as const).map((company) => <button key={company} type="button" disabled={!context} aria-pressed={context?.company === company} onClick={() => selectRole(company)} className={`min-w-[86px] rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${context?.company === company ? "bg-brand text-white shadow-sm" : "text-body hover:bg-surface"}`}>{company}</button>)}
        </div>
        {roleDraft ? <button className="ui-button ui-button-secondary" disabled={profile.saving} onClick={async () => {
          const writing = roleDraft;
          if (profile.document && await profile.save({ ...profile.document, context: writing })) { setRoleDraft((current) => current === writing ? null : current); setNotice("岗位背景已保存；原始故事与 Introduction 保持原文。"); }
        }}>{profile.saving ? "Saving…" : "Save context"}</button> : null}
      </div>
    </header>

    <section className="ui-card mt-7 flex flex-wrap items-center gap-5 px-6 py-5" aria-labelledby="profile-overview">
      <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#f4f5f9] text-[#293655]"><Icon name="user" size={34} /></span>
      <div className="min-w-0 flex-1"><h2 id="profile-overview" className="text-xl font-semibold tracking-tight text-ink">{profile.document?.profile.displayName || "Your profile"}</h2><p className="mt-1.5 text-sm leading-6 text-muted">Role focus: <span className="text-body">{context ? roleTemplates[context.focus].label : "Loading your private profile…"}</span><span className="mx-3 text-line" aria-hidden="true">|</span>Interview: <span className="text-body">{context?.interviewDate || "Add a date privately"}</span></p></div>
      <Link href="/prepare/profile" className="ui-button ui-button-secondary">Edit profile</Link>
    </section>

    {profile.error || studio.error ? <div role="alert" className="ui-card mt-5 border-[#eddbcf] p-5 text-sm leading-6 text-[#9a5737]">{profile.error || studio.error}<div className="mt-3 flex flex-wrap gap-3"><button className="ui-button" onClick={async () => {
      const [profileLoaded, studioLoaded] = await Promise.all([profile.reload(), studio.reload()]);
      if (profileLoaded) setRoleDraft(null);
      if (studioLoaded) setStudioDraft(null);
    }}>{roleDraft || studioDraft ? "放弃本页未保存修改并载入云端" : "重新载入云端资料"}</button><span className="self-center text-xs">重新载入前，请先复制需要保留的未保存文本。</span></div></div> : null}
    <p role="status" className="mt-3 min-h-5 text-xs text-teaching">{notice}</p>

    <div className="mt-4 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(350px,.98fr)]">
      <section aria-labelledby="stories-heading">
        <div className="mb-4 flex items-center justify-between gap-3"><h2 id="stories-heading" className="text-2xl font-semibold tracking-tight text-ink">Your stories</h2><Link href="/prepare/profile#stories" className="ui-button ui-button-primary"><Icon name="file" size={19} />Project evidence</Link></div>
        {studio.loading ? <div className="ui-card p-7 text-sm text-muted" role="status">Loading your private stories…</div> : null}
        {!studio.loading && !stories.length ? <div className="ui-card p-7 text-sm leading-7 text-muted">还没有可读取的 Studio 故事。原记录不会被示例故事替代。<Link href="/prepare/profile#stories" className="mt-3 block font-semibold text-brand">整理个人事实与项目故事 →</Link></div> : null}
        <div className="grid gap-3.5 sm:grid-cols-2">
          {stories.map((story, index) => <button key={story.id} type="button" onClick={() => { setSelectedId(story.id); setRunning(false); setElapsed(0); }} aria-pressed={selected?.id === story.id} aria-controls="story-editor" className={`ui-card group flex min-h-[176px] flex-col p-4 text-left transition-shadow hover:shadow-md ${selected?.id === story.id ? "border-brand ring-1 ring-brand" : "hover:border-[#bbc4e8]"}`}>
            <span className="flex items-start gap-3"><span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${index % 3 === 0 ? "bg-[#edf1ff] text-[#5266dc]" : index % 3 === 1 ? "bg-[#f0edfe] text-[#7866ca]" : "bg-[#e5f4ee] text-[#479b81]"}`}><Icon name={storyIcons[index % storyIcons.length]} size={23} /></span><span className="min-w-0"><span className="block text-sm font-semibold leading-6 text-ink">{story.title}</span><span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted">{typeof story.subtitle === "string" ? story.subtitle : "复盘真实背景、个人行动与结果边界。"}</span></span></span>
            <span className="mt-auto flex items-center justify-between gap-2 pt-4"><Status ready={story.readiness === "ready"} /><Icon name="chevron-right" size={18} className="text-[#7885a6]" /></span>
          </button>)}
        </div>
        <p className="mt-3 text-xs leading-5 text-muted">状态沿用原资料；“可练口述”不等于事实已获独立核验。</p>
        <nav aria-label="Advanced practice" className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link href="/prepare/studio#behavior" className="ui-card flex items-center gap-3 p-4 text-sm font-semibold text-body hover:border-[#bbc4e8]"><Icon name="message" size={21} className="text-brand" /><span>Behavioral questions<span className="mt-1 block text-xs font-normal text-muted">{bundle ? `${bundle.behavior.questions.length} questions · 计时与追问` : "完整行为练习"}</span></span><Icon name="arrow-right" size={17} className="ml-auto text-muted" /></Link>
          <Link href="/prepare/studio#foundations" className="ui-card flex items-center gap-3 p-4 text-sm font-semibold text-body hover:border-[#bbc4e8]"><Icon name="book" size={21} className="text-brand" /><span>Technical foundations<span className="mt-1 block text-xs font-normal text-muted">{bundle ? `${bundle.foundations.questions.length} questions · 测验与薄弱项` : "完整基础练习"}</span></span><Icon name="arrow-right" size={17} className="ml-auto text-muted" /></Link>
        </nav>
      </section>

      <section id="story-editor" className="ui-card min-w-0 p-5 sm:p-6 xl:sticky xl:top-6" aria-labelledby="story-title">
        {selected ? <>
          <div className="flex items-start justify-between gap-3"><h2 id="story-title" className="min-w-0 text-xl font-semibold leading-8 tracking-tight text-ink">{selected.title}</h2><span className="flex shrink-0 items-center gap-1.5 pt-1 text-xs text-muted"><Icon name="lock" size={14} />Private</span></div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3"><p className="text-xs leading-5 text-muted">保留原始叙述，补充时明确个人与团队边界。</p><Status ready={selected.readiness === "ready"} /></div>
          <div className="mt-5 flex overflow-x-auto border-b border-line" role="tablist" aria-label="Story answer sections">
            {tabs.map((item) => <button key={item.id} type="button" role="tab" id={`story-tab-${item.id}`} aria-selected={tab === item.id} aria-controls="story-panel" tabIndex={tab === item.id ? 0 : -1} onKeyDown={tabKeys} onClick={() => setTab(item.id)} className={`min-w-0 flex-1 whitespace-nowrap border-b-2 px-2 py-3 text-xs font-medium ${tab === item.id ? "border-brand text-brand" : "border-transparent text-muted hover:text-body"}`}>{item.label}</button>)}
          </div>
          <div id="story-panel" role="tabpanel" aria-labelledby={`story-tab-${tab}`} className="mt-4">
            <label className="sr-only" htmlFor="story-draft">{tab === "spoken" ? "English spoken answer" : `${tabs.find((item) => item.id === tab)?.label} draft`}</label>
            <textarea id="story-draft" className="ui-input ui-textarea w-full text-sm" lang={tab === "spoken" ? "en" : undefined} value={activeText} onChange={(event) => editStory(event.target.value)} placeholder={tab === "a" ? "Describe what you personally changed. Separate your action from the team's work." : "保留事实，说明背景、行动与结果。"} />
            {studioDraft ? <p className="mt-2 text-xs text-[#916d31]">有未保存的文稿修改。</p> : null}
          </div>
          <details className="mt-5 border-b border-line pb-4"><summary className="cursor-pointer text-sm font-semibold text-ink">事实边界与待补信息</summary><p className="mt-2 text-xs leading-6 text-muted">以下是原资料的核对提示，不会因切换公司或保存文稿自动变成已确认经历。</p>
            {selected.guardrails?.length ? <ul className="mt-3 list-disc space-y-2 pl-4 text-xs leading-6 text-body">{selected.guardrails.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="mt-3 text-xs text-muted">原故事未记录额外边界提示。</p>}
            {selected.missingFacts?.length ? <div className="mt-4 rounded-xl bg-[#fbf6ec] p-3"><h3 className="text-xs font-semibold text-[#916d31]">待补事实</h3><ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-6 text-body">{selected.missingFacts.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
          </details>
          {context ? <div className="mt-4"><h3 className="text-xs font-semibold text-ink">Interview angle</h3><p className="mt-2 rounded-xl bg-[#f3f5fa] px-3 py-2.5 text-xs leading-6 text-muted">{roleTemplates[context.focus].emphasis}</p></div> : null}
          <div className="mt-5 flex flex-wrap justify-end gap-3"><button className="ui-button ui-button-secondary" disabled={!studioDraft || studio.saving} onClick={async () => {
            const writing = studioDraft;
            if (writing && await studio.save(writing)) { setStudioDraft((current) => current === writing ? null : current); setNotice("故事文稿已保存到私人空间；原准备状态与事实边界保留。"); }
          }}>{studio.saving ? "Saving…" : "Save changes"}</button><button className="ui-button ui-button-primary" onClick={startPractice}><Icon name="play" size={17} />Practice story</button></div>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4"><Icon name="clock" size={17} className="text-muted" /><span className="text-xs text-muted">60s target</span><output aria-live="polite" aria-label="Practice elapsed time" className={`font-mono text-lg ${elapsed > 60 ? "text-[#a16f32]" : "text-ink"}`}>{minutes}:{seconds}</output><button className="ui-button ui-button-quiet !min-h-8 !px-2 !py-1" aria-label={running ? "Pause practice timer" : "Start practice timer"} onClick={() => { if (running) setRunning(false); else startPractice(); }}><Icon name={running ? "pause" : "play"} size={16} /></button><button className="ui-button ui-button-quiet !min-h-8 !px-2 !py-1" aria-label="Reset practice timer" onClick={() => { setRunning(false); setElapsed(0); }}><Icon name="refresh" size={16} /></button></div>
          <p className="mt-1 text-[11px] leading-5 text-muted">只计时，不录音或自动评分。完整练习记录可在 Behavioral practice 中保存。</p>
        </> : <p id="story-title" className="py-8 text-sm leading-7 text-muted">载入私人故事后，在这里整理 STAR 与英文口述。</p>}
      </section>
    </div>

    {bundle ? <details className="ui-card mt-7 p-5 sm:p-6"><summary className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-ink"><Icon name="lock" size={18} className="text-brand" />Your original introduction<span className="ml-auto text-xs font-normal text-muted">Read only · 保留原文</span></summary><p className="mt-4 text-xs leading-6 text-muted">这是已保存资料中的原始定稿。切换岗位背景不会自动替换公司名称、重写经历或把团队成果归为个人成果。</p><p lang="en" className="mt-4 whitespace-pre-wrap text-sm leading-8 text-body">{bundle.behavior.introLocked}</p><Link href="/prepare/studio#behavior" className="ui-button ui-button-secondary mt-4">Open full introduction practice<Icon name="arrow-right" size={16} /></Link></details> : null}
  </main>;
}
