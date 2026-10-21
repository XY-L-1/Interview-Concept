"use client";

import { useEffect, useRef, useState } from "react";
import { behaviorRoleAngles, getBehaviorMap } from "./behavior-map";
import type { StudioBundle } from "./studio-model";

export function BehaviorPracticeMap({ bundle, company, onEdit, onSave, dirty, saving }: {
  bundle: StudioBundle; company: string; onEdit: (id: string, text: string) => void; onSave: () => void; dirty: boolean; saving: boolean;
}) {
  const { questions, competencies, needsDetails } = getBehaviorMap(bundle);
  const [dimension, setDimension] = useState("all");
  const [search, setSearch] = useState("");
  const [gapsOnly, setGapsOnly] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const started = useRef(0);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds(Math.floor((Date.now() - started.current) / 1000)), 250);
    return () => clearInterval(timer);
  }, [running]);
  const competency = competencies.find((item) => item.id === dimension);
  const visible = questions.filter((question) => (!competency || competency.questionIds.includes(question.id)) && (!gapsOnly || needsDetails.includes(question)) && `${question.title} ${question.intent ?? ""} ${question.category ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const selected = visible.find((question) => question.id === selectedId) ?? visible[0];
  const selectedCompetencies = selected ? competencies.filter((item) => item.questionIds.includes(selected.id)) : [];
  const angle = behaviorRoleAngles[competency?.id ?? selectedCompetencies[0]?.id ?? ""];
  function resetPractice() { setShowAnswer(false); setRunning(false); setSeconds(0); }

  return <section id="competencies" className="mt-6 scroll-mt-6" aria-labelledby="competencies-heading">
    <h2 id="competencies-heading" className="text-2xl font-semibold text-ink">按能力练习 · Behavioral map</h2>
    <p className="mt-3 text-sm leading-7 text-body">{competencies.length} 个能力维度 · {questions.length} 道问题 · {bundle.behavior.stories.length} 个可复用故事。一个故事可以支持不同角度，每道题都有独立回答。还有 {needsDetails.length} 题需要补真实细节。</p>
    <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4" role="group" aria-label="Behavioral competency filters">
      <button className={`ui-card col-span-2 p-3 text-left text-sm lg:col-span-4 ${dimension === "all" ? "border-brand ring-1 ring-brand" : ""}`} aria-pressed={dimension === "all"} onClick={() => { setDimension("all"); resetPractice(); }}>全部问题 · {questions.length}<span className="mt-1 block text-xs text-muted">包含开场、动机、薪酬与反问</span></button>
      {competencies.map((item) => <button key={item.id} className={`ui-card p-3 text-left text-sm ${dimension === item.id ? "border-brand ring-1 ring-brand" : ""}`} aria-pressed={dimension === item.id} onClick={() => { setDimension(item.id); resetPractice(); }}><strong className="block text-ink">{item.title}</strong><span className="mt-1 block text-xs text-muted">{item.questionIds.filter((id) => questions.some((q) => q.id === id)).length} 题 · {item.storyIds.length ? "有候选故事" : "待补真实事件"}</span></button>)}
    </div>
    {competency ? <div className="mt-4 rounded-xl bg-[#edf4f2] p-4 text-sm leading-7"><p>{competency.description}</p><p className="mt-1"><strong>练习目标：</strong>{competency.practiceGoal}</p></div> : null}
    <div className="mt-4 flex flex-wrap items-center gap-3"><label className="min-w-0 flex-1"><span className="sr-only">搜索行为问题</span><input className="ui-input w-full" value={search} onChange={(event) => { setSearch(event.target.value); resetPractice(); }} placeholder="搜索问题，例如 challenge、leadership、协作" /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={gapsOnly} onChange={(event) => { setGapsOnly(event.target.checked); resetPractice(); }} />只看待补事实</label></div>
    <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(230px,.7fr)_minmax(0,1.3fr)]">
      <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1 xl:max-h-[580px]" aria-label="Behavioral questions">{visible.map((question) => <button key={question.id} className={`ui-card block w-full p-4 text-left ${selected?.id === question.id ? "border-brand ring-1 ring-brand" : ""}`} aria-pressed={selected?.id === question.id} onClick={() => { setSelectedId(question.id); resetPractice(); }}><span className="block text-sm font-semibold leading-6 text-ink">{question.title}</span><span className="mt-1 block text-xs text-muted">{question.category} · {needsDetails.includes(question) ? "待补事实" : "已有口述草稿"}</span></button>)}{!visible.length ? <p role="status" className="ui-card p-5 text-sm">没有符合当前筛选的问题。清除搜索或取消“只看待补事实”后再试。</p> : null}</div>
      {selected ? <article className="ui-card min-w-0 p-5 sm:p-6" aria-labelledby="behavior-question-title">
        <p className="text-xs font-semibold text-brand">{selectedCompetencies.map((item) => item.title.split(" / ")[0]).join(" · ") || selected.category}</p><h3 id="behavior-question-title" className="mt-2 text-xl font-semibold leading-8 text-ink">{selected.title}</h3>
        <p className="mt-3 text-sm leading-7 text-body">{selected.intent}</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-body">{selected.outline.map((item) => <li key={item}>{item}</li>)}</ol>
        {angle ? <p className="mt-4 rounded-xl bg-[#edf1ff] p-4 text-sm leading-7"><strong>{company === "Temu" ? "Temu" : "Applied AI"} 讲述角度：</strong>{company === "Temu" ? angle.temu : angle.ai}</p> : null}
        <p className="mt-4 text-xs leading-6 text-muted">原回答来自 Simple AI 准备资料，含公司名称的动机、开场与反问不能直接用于另一家公司。事实不随岗位改变。</p>
        <div className="mt-4 flex flex-wrap items-center gap-3"><button className="ui-button ui-button-primary" onClick={() => setShowAnswer(!showAnswer)}>{showAnswer ? "收起参考，自己讲" : "查看 / 编辑英文回答"}</button><button className="ui-button ui-button-secondary" onClick={() => { started.current = Date.now() - seconds * 1000; setRunning(!running); }}>{running ? "暂停计时" : "开始口述"}</button><output aria-label="Behavior practice timer" className="font-mono text-lg">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</output><button className="text-xs text-muted" onClick={() => { setRunning(false); setSeconds(0); }}>重置</button></div>
        {showAnswer ? <div className="mt-4"><label className="text-sm font-semibold" htmlFor="behavior-answer">English answer · 原稿 / 私人修改</label><textarea id="behavior-answer" lang="en" className="ui-input ui-textarea mt-2 w-full !min-h-[280px]" value={selected.answer} onChange={(event) => onEdit(selected.id, event.target.value)} /><button className="ui-button ui-button-secondary mt-3" disabled={!dirty || saving} onClick={onSave}>{saving ? "Saving…" : "保存本页修改到私人空间"}</button>{dirty ? <p className="mt-2 text-xs text-[#916d31]">本页有未保存修改。</p> : null}</div> : null}
        {selected.missingFacts?.length ? <div className="mt-5 rounded-xl bg-[#fbf6ec] p-4"><h4 className="font-semibold text-[#916d31]">这题还缺哪些事实</h4><ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-7">{selected.missingFacts.map((item) => <li key={item}>{item}</li>)}</ul><p className="mt-2 text-xs leading-6">方括号是待填位置；补充真实事件后再练完整答案，保存不会自动把它标为已核实。</p></div> : null}
        {selected.followUps?.length ? <details className="mt-5"><summary className="cursor-pointer text-sm font-semibold">继续追问 · {selected.followUps.length}</summary><ul className="mt-3 space-y-3">{selected.followUps.map((item, index) => <li key={index} className="text-sm leading-7">{typeof item === "string" ? item : <><p>{item.q}</p><p className="text-muted">{item.guide}</p></>}</li>)}</ul></details> : null}
        <div className="mt-5 border-t border-line pt-4"><h4 className="text-sm font-semibold">这题可用的真实故事</h4>{selected.storyIds.length ? selected.storyIds.map((id) => { const story = bundle.behavior.stories.find((item) => item.id === id); return story ? <details key={id} className="mt-3 rounded-xl border border-line p-3"><summary className="cursor-pointer text-sm font-medium">{story.title}</summary><p lang="en" className="mt-3 whitespace-pre-wrap text-sm leading-7">{String(story.spoken)}</p><ul className="mt-3 list-disc pl-4 text-xs leading-6 text-muted">{(story.guardrails as string[] ?? []).map((item) => <li key={item}>{item}</li>)}</ul></details> : null; }) : <p className="mt-2 text-sm leading-7 text-muted">目前没有已关联的真实事件。保留问题与结构，不能用虚构冲突或失误填补。</p>}</div>
      </article> : null}
    </div>
  </section>;
}
