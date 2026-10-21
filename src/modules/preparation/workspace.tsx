"use client";

import { useEffect, useState, type ReactNode } from "react";
import { buildPreparation } from "./answers";
import { validateWorkspace, type Contribution, type Fact, type Focus, type PreparationWorkspace, type Provenance, type Story } from "./model";
import { roleTemplates } from "./roles";
import { usePrivateDocument } from "./use-private-document";

const control = "ui-input mt-2 block w-full";
const provenanceLabels: Record<Provenance, string> = { "user-confirmed": "用户确认", "code-evidence": "代码证据", "needs-review": "待核实" };
const contributionLabels: Record<Contribution, string> = { personal: "个人贡献", team: "团队流程 / 成果", context: "背景资料" };

function parseProfile(input: unknown): PreparationWorkspace {
  const result = validateWorkspace(input);
  if (!result.ok) throw new Error(`个人资料格式无效：${result.errors[0]}`);
  return result.value;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm font-medium text-body">{label}{children}</label>;
}

function FactEditor({ fact, index, onChange, onRemove }: { fact: Fact; index: number; onChange: (patch: Partial<Fact>) => void; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(!fact.text);
  const [tagInput, setTagInput] = useState(fact.tags.join(", "));
  return (
    <details className="rounded-xl border border-line bg-white p-5" open={expanded} onToggle={(event) => setExpanded(event.currentTarget.open)}>
      <summary className="cursor-pointer text-sm font-semibold leading-6 text-ink">
        {index + 1}. {fact.text || "填写一条准确的事实"}
        <span className="mt-2 flex flex-wrap gap-2 text-xs font-normal text-muted"><span className="rounded-full bg-surface px-3 py-1">{provenanceLabels[fact.provenance]}</span><span className="rounded-full bg-surface px-3 py-1">{contributionLabels[fact.contribution]}</span></span>
      </summary>
      <div className="mt-5 space-y-4">
        <Field label="事实原文"><textarea className={control} rows={3} value={fact.text} onChange={(event) => onChange({ text: event.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="证据状态"><select className={control} value={fact.provenance} onChange={(event) => onChange({ provenance: event.target.value as Provenance })}>{Object.entries(provenanceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
          <Field label="贡献归属"><select className={control} value={fact.contribution} onChange={(event) => onChange({ contribution: event.target.value as Contribution })}>{Object.entries(contributionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
        </div>
        <Field label="主题标签（逗号分隔）"><input className={control} value={tagInput} onChange={(event) => { setTagInput(event.target.value); onChange({ tags: [...new Set(event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))] }); }} /></Field>
        <Field label="来源 / 证据说明"><textarea className={control} rows={2} value={fact.source} onChange={(event) => onChange({ source: event.target.value })} /></Field>
        <button className="ui-button text-sm" type="button" onClick={onRemove}>删除事实</button>
      </div>
    </details>
  );
}

function StoryEditor({ story, facts, onChange, onRemove }: { story: Story; facts: readonly Fact[]; onChange: (patch: Partial<Story>) => void; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(!story.title);
  return (
    <details className="rounded-xl border border-line bg-white p-5" open={expanded} onToggle={(event) => setExpanded(event.currentTarget.open)}>
      <summary className="cursor-pointer text-sm font-semibold text-ink">{story.title || "新项目故事"}<span className="ml-3 text-xs font-normal text-muted">{story.factIds.length} 条关联事实</span></summary>
      <div className="mt-5 space-y-4">
        <Field label="故事标题"><input className={control} value={story.title} onChange={(event) => onChange({ title: event.target.value })} /></Field>
        <fieldset><legend className="text-sm font-medium text-body">关联事实</legend>
          {facts.length ? <div className="mt-3 max-h-72 space-y-3 overflow-y-auto rounded-xl bg-surface p-4">{facts.map((fact) => <label key={fact.id} className="flex items-start gap-3 text-sm leading-6 text-body"><input type="checkbox" className="mt-1 accent-brand" checked={story.factIds.includes(fact.id)} onChange={(event) => onChange({ factIds: event.target.checked ? [...story.factIds, fact.id] : story.factIds.filter((id) => id !== fact.id) })} /><span>{fact.text || "尚未填写的事实"}<span className="block text-xs text-muted">{provenanceLabels[fact.provenance]} · {contributionLabels[fact.contribution]}</span></span></label>)}</div> : <p className="mt-2 text-sm text-muted">先添加事实，再关联到这个项目。</p>}
        </fieldset>
        <Field label="复盘 / 备考笔记"><textarea className={control} rows={3} value={story.reflection} onChange={(event) => onChange({ reflection: event.target.value })} /></Field>
        <p className="text-xs leading-5 text-muted">笔记单独展示，不会自动变成个人工作经历。</p>
        <button className="ui-button text-sm" type="button" onClick={onRemove}>删除故事</button>
      </div>
    </details>
  );
}

type EditorProps = { initial: PreparationWorkspace; saving: boolean; loading: boolean; error: string | null; save: (content: PreparationWorkspace) => Promise<boolean>; reload: () => Promise<boolean>; onReloaded: () => void };

function WorkspaceEditor({ initial, saving, loading, error, save, reload, onReloaded }: EditorProps) {
  const [workspace, setWorkspace] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState("资料已从你的账户载入。");
  const preparation = buildPreparation(workspace);

  useEffect(() => {
    if (!dirty) return;
    const leaving = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", leaving);
    return () => window.removeEventListener("beforeunload", leaving);
  }, [dirty]);

  function update(change: (current: PreparationWorkspace) => PreparationWorkspace) {
    setWorkspace(change); setDirty(true); setErrors([]); setNotice("有尚未保存的修改。");
  }
  function updateFact(id: string, patch: Partial<Fact>) {
    update((current) => ({ ...current, profile: { ...current.profile, facts: current.profile.facts.map((fact) => fact.id === id ? { ...fact, ...patch } : fact) } }));
  }
  function updateStory(id: string, patch: Partial<Story>) {
    update((current) => ({ ...current, profile: { ...current.profile, stories: current.profile.stories.map((story) => story.id === id ? { ...story, ...patch } : story) } }));
  }
  async function saveProfile() {
    const result = validateWorkspace(workspace);
    if (!result.ok) { setErrors(result.errors); return; }
    if (await save(result.value)) { setDirty(false); setErrors([]); setNotice("已保存到账户云端。"); }
  }
  async function reloadProfile() {
    if (dirty && !window.confirm("重新载入会放弃本页未保存的修改。继续前可先在“备份”中导出草稿。是否继续？")) return;
    if (await reload()) onReloaded();
  }
  function exportJson() {
    const blob = new Blob([`${JSON.stringify(workspace, null, 2)}\n`], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "interview-profile-backup.json";
    document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }

  return <div className="space-y-6">
    <div className="ui-card flex flex-wrap items-center justify-between gap-4 p-5">
      <div><p className="text-sm font-semibold text-ink">Private account workspace</p><p role="status" className="mt-1 text-sm text-muted">{saving ? "正在保存…" : loading ? "正在重新载入…" : notice}</p></div>
      <div className="flex gap-3"><button className="ui-button" disabled={saving || loading} type="button" onClick={() => void reloadProfile()}>重新载入</button><button className="ui-button ui-button-primary" disabled={saving || loading || !dirty} type="button" onClick={() => void saveProfile()}>保存到账户云端{dirty ? " *" : ""}</button></div>
    </div>
    {error ? <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{error}</p> : null}
    {errors.length ? <ul role="alert" className="list-disc rounded-xl border border-amber-200 bg-amber-50 p-5 pl-10 text-sm leading-6 text-amber-950">{errors.map((message, index) => <li key={index}>{message}</li>)}</ul> : null}
    <fieldset disabled={saving || loading} className="min-w-0 space-y-6 disabled:opacity-70">
      <section id="profile" aria-labelledby="facts-heading" className="ui-card p-6 sm:p-8">
        <h2 id="facts-heading" className="text-xl font-semibold text-ink">Your profile · 真实经历</h2>
        <p className="mt-2 text-sm leading-6 text-muted">只有“用户确认”或“代码证据”的个人贡献会进入英文回答。团队成果、背景和待核实内容保留原有边界。</p>
        <div className="mt-5 max-w-md"><Field label="称呼 / 英文名"><input className={control} value={workspace.profile.displayName} onChange={(event) => update((current) => ({ ...current, profile: { ...current.profile, displayName: event.target.value } }))} /></Field></div>
        <div className="mt-6 space-y-3">{workspace.profile.facts.map((fact, index) => <FactEditor key={fact.id} fact={fact} index={index} onChange={(patch) => updateFact(fact.id, patch)} onRemove={() => update((current) => ({ ...current, profile: { ...current.profile, facts: current.profile.facts.filter((item) => item.id !== fact.id), stories: current.profile.stories.map((story) => ({ ...story, factIds: story.factIds.filter((id) => id !== fact.id) })) } }))} />)}</div>
        <button className="ui-button mt-4" type="button" onClick={() => update((current) => ({ ...current, profile: { ...current.profile, facts: [...current.profile.facts, { id: crypto.randomUUID(), text: "", tags: [], provenance: "needs-review", contribution: "context", source: "" }] } }))}>＋ 添加事实</button>
      </section>
      <section id="stories" aria-labelledby="stories-heading" className="ui-card p-6 sm:p-8">
        <h2 id="stories-heading" className="text-xl font-semibold text-ink">Project stories · 项目事实</h2><p className="mt-2 text-sm leading-6 text-muted">关联同一项目的事实；调整岗位不会改变原文、来源或贡献归属。</p>
        <div className="mt-5 space-y-3">{workspace.profile.stories.map((story) => <StoryEditor key={story.id} story={story} facts={workspace.profile.facts} onChange={(patch) => updateStory(story.id, patch)} onRemove={() => update((current) => ({ ...current, profile: { ...current.profile, stories: current.profile.stories.filter((item) => item.id !== story.id) } }))} />)}</div>
        <button className="ui-button mt-4" type="button" onClick={() => update((current) => ({ ...current, profile: { ...current.profile, stories: [...current.profile.stories, { id: crypto.randomUUID(), title: "", factIds: [], reflection: "" }] } }))}>＋ 添加项目故事</button>
      </section>
      <section id="role-context" aria-labelledby="role-heading" className="ui-card p-6 sm:p-8">
        <h2 id="role-heading" className="text-xl font-semibold text-ink">Role context · 这次面试</h2><p className="mt-2 text-sm leading-6 text-muted">公司影响动机笔记与反问；岗位影响强调顺序和追问。经历事实始终不变，公司业务和动机由你核实填写。</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="公司"><input className={control} value={workspace.context.company} onChange={(event) => update((current) => ({ ...current, context: { ...current.context, company: event.target.value } }))} /></Field>
          <Field label="岗位"><input className={control} value={workspace.context.roleTitle} onChange={(event) => update((current) => ({ ...current, context: { ...current.context, roleTitle: event.target.value } }))} /></Field>
          <Field label="侧重点"><select className={control} value={workspace.context.focus} onChange={(event) => update((current) => ({ ...current, context: { ...current.context, focus: event.target.value as Focus } }))}>{Object.entries(roleTemplates).map(([value, template]) => <option key={value} value={value}>{template.label}</option>)}</select></Field>
          <Field label="面试日期"><input className={control} type="date" value={workspace.context.interviewDate} onChange={(event) => update((current) => ({ ...current, context: { ...current.context, interviewDate: event.target.value } }))} /></Field>
        </div><div className="mt-5"><Field label="Why this company / JD 要点 / HR 待确认事项"><textarea className={control} rows={4} value={workspace.context.notes} onChange={(event) => update((current) => ({ ...current, context: { ...current.context, notes: event.target.value } }))} /></Field></div>
      </section>
    </fieldset>
    <section id="rehearsal" aria-labelledby="rehearsal-heading" className="ui-card p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand">{preparation.template.label}</p><h2 id="rehearsal-heading" className="mt-2 text-xl font-semibold text-ink">Rehearsal · 开口练习</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{preparation.template.emphasis} 当前有 {preparation.confirmedCount} 条可使用的个人事实；以下按已有事实整理，不新增经历。</p>
      <article className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5"><h3 className="text-sm font-semibold text-ink">英文自我介绍</h3><p lang="en" className="mt-3 whitespace-pre-wrap text-base leading-8 text-body">{preparation.introduction}</p></article>
      {preparation.stories.map((story) => <article key={story.id} className="mt-5 rounded-xl border border-line p-5"><h3 className="font-semibold text-ink">{story.title || "尚未命名的项目"}</h3>{story.teamContext ? <div className="mt-4 border-l-2 border-line pl-4"><h4 className="text-xs font-semibold text-muted">System context · 团队流程</h4><p lang="en" className="mt-2 whitespace-pre-wrap text-sm leading-7 text-body">{story.teamContext}</p></div> : null}<h4 className="mt-4 text-xs font-semibold text-brand">My contribution · 个人贡献</h4><p lang="en" className="mt-2 whitespace-pre-wrap text-sm leading-7 text-body">{story.answer}</p><p className="mt-3 text-xs text-muted">纳入 {story.includedFactIds.length} 条个人事实；{story.excludedCount} 条团队、背景或待核实事实保留在回答之外。</p>{story.reflection ? <p className="mt-4 whitespace-pre-wrap border-t border-line pt-4 text-sm leading-6 text-muted">复盘：{story.reflection}</p> : null}</article>)}
      <div className="mt-5 rounded-xl bg-surface p-5"><h3 className="text-sm font-semibold text-ink">对应追问</h3><ol lang="en" className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-body">{preparation.template.questions.map((question) => <li key={question}>{question}</li>)}</ol></div>
    </section>
    <details className="ui-card p-5"><summary className="cursor-pointer text-sm font-semibold text-muted">备份</summary><p className="mt-3 text-sm leading-6 text-muted">导出当前草稿作为本地 JSON，包括尚未保存的内容。文件含私密资料，请自行保管。</p><button className="ui-button mt-4" type="button" onClick={exportJson}>导出当前草稿</button></details>
  </div>;
}

export function PreparationWorkspacePage() {
  const cloud = usePrivateDocument("profile", parseProfile);
  const [generation, setGeneration] = useState(0);
  if (!cloud.document) return <div className="ui-card p-6"><p role={cloud.error ? "alert" : "status"} className="text-sm leading-6 text-muted">{cloud.error || "正在读取你的个人资料…"}</p>{cloud.error ? <button className="ui-button mt-4" type="button" onClick={() => void cloud.reload()}>重试</button> : null}</div>;
  return <WorkspaceEditor key={generation} initial={cloud.document} saving={cloud.saving} loading={cloud.loading} error={cloud.error} save={cloud.save} reload={cloud.reload} onReloaded={() => setGeneration((value) => value + 1)} />;
}
