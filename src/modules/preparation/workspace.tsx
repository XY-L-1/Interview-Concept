"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { buildPreparation } from "./answers";
import {
  createEmptyWorkspace,
  parseWorkspace,
  serializeWorkspace,
  STORAGE_KEY,
  validateWorkspace,
  type Contribution,
  type Fact,
  type Focus,
  type PreparationWorkspace,
  type Provenance,
  type Story,
} from "./model";
import { roleTemplates } from "./roles";

const control = "mt-2 block w-full rounded border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand";
const button = "rounded border border-line bg-background px-4 py-2 text-sm font-semibold text-ink outline-none hover:border-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50";
const primary = `${button} border-brand bg-brand text-white hover:bg-brand-strong`;

const provenanceLabels: Record<Provenance, string> = {
  "user-confirmed": "用户确认",
  "code-evidence": "代码证据",
  "needs-review": "旧分析 / 待核实",
};
const contributionLabels: Record<Contribution, string> = {
  personal: "个人贡献",
  team: "团队流程 / 成果",
  context: "背景资料",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm font-medium text-body">{label}{children}</label>;
}

function loadSavedWorkspace() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { workspace: createEmptyWorkspace(), errors: [] as string[], saved: false };
    const result = parseWorkspace(raw);
    return result.ok
      ? { workspace: result.value, errors: [], saved: true }
      : { workspace: createEmptyWorkspace(), errors: ["本地数据未能恢复；原记录已保留。", ...result.errors], saved: false };
  } catch {
    return {
      workspace: createEmptyWorkspace(),
      errors: ["浏览器存储不可用。仍可在当前页面编辑并导出 JSON。"],
      saved: false,
    };
  }
}

function FactEditor({ fact, index, onChange, onRemove }: {
  fact: Fact;
  index: number;
  onChange: (patch: Partial<Fact>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(!fact.text);
  return (
    <details className="rounded border border-line bg-background p-4" open={expanded} onToggle={(event) => setExpanded(event.currentTarget.open)}>
      <summary className="cursor-pointer text-sm font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand">
        {index + 1}. {fact.text || "新事实：填写准确的个人或团队事实"}
        <span className="mt-1 block text-xs font-normal text-muted">
          {provenanceLabels[fact.provenance]} · {contributionLabels[fact.contribution]}
        </span>
      </summary>
      <div className="mt-4 space-y-4">
        <Field label="事实原文（建议英文完整句；保持个人 / 团队主语准确）">
          <textarea className={control} rows={3} value={fact.text} onChange={(event) => onChange({ text: event.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="证据状态">
            <select className={control} value={fact.provenance} onChange={(event) => onChange({ provenance: event.target.value as Provenance })}>
              {Object.entries(provenanceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </Field>
          <Field label="贡献归属">
            <select className={control} value={fact.contribution} onChange={(event) => onChange({ contribution: event.target.value as Contribution })}>
              {Object.entries(contributionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </Field>
        </div>
        <Field label="主题标签（逗号分隔，如 java,kafka,reliability 或 ai,evaluation）">
          <input className={control} value={fact.tags.join(",")} onChange={(event) => onChange({ tags: event.target.value.trim() ? event.target.value.split(",").map((tag) => tag.trim()) : [] })} />
        </Field>
        <Field label="来源 / 证据说明（仅本地记录）">
          <textarea className={control} rows={2} value={fact.source} onChange={(event) => onChange({ source: event.target.value })} />
        </Field>
        <p className="break-all font-mono text-xs text-muted">稳定事实 ID：{fact.id}</p>
        <button className={button} type="button" onClick={onRemove}>删除此事实</button>
      </div>
    </details>
  );
}

function StoryEditor({ story, facts, onChange, onRemove }: {
  story: Story;
  facts: readonly Fact[];
  onChange: (patch: Partial<Story>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(!story.title);
  return (
    <details className="rounded border border-line bg-background p-4" open={expanded} onToggle={(event) => setExpanded(event.currentTarget.open)}>
      <summary className="cursor-pointer text-sm font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand">{story.title || "新项目故事"}</summary>
      <div className="mt-4 space-y-4">
        <Field label="故事标题"><input className={control} value={story.title} onChange={(event) => onChange({ title: event.target.value })} /></Field>
        <fieldset>
          <legend className="text-sm font-medium text-body">关联事实（复用原事实，岗位切换不会改写）</legend>
          {facts.length ? <div className="mt-3 space-y-3">{facts.map((fact) => (
            <label key={fact.id} className="flex items-start gap-3 text-sm leading-6 text-body">
              <input type="checkbox" className="mt-1 accent-brand" checked={story.factIds.includes(fact.id)} onChange={(event) => onChange({ factIds: event.target.checked ? [...story.factIds, fact.id] : story.factIds.filter((id) => id !== fact.id) })} />
              <span>{fact.text || "尚未填写的事实"}<span className="block text-xs text-muted">{provenanceLabels[fact.provenance]} · {contributionLabels[fact.contribution]}</span></span>
            </label>
          ))}</div> : <p className="mt-2 text-sm text-muted">先添加事实，再在这里关联。</p>}
        </fieldset>
        <Field label="复盘 / 备考笔记（单独展示，不自动变为工作经历）"><textarea className={control} rows={3} value={story.reflection} onChange={(event) => onChange({ reflection: event.target.value })} /></Field>
        <button className={button} type="button" onClick={onRemove}>删除此故事</button>
      </div>
    </details>
  );
}

function WorkspaceEditor() {
  const [initial] = useState(loadSavedWorkspace);
  const [workspace, setWorkspace] = useState(initial.workspace);
  const [errors, setErrors] = useState<string[]>(initial.errors);
  const [notice, setNotice] = useState(initial.saved ? "已恢复此浏览器保存的资料。" : "尚未保存个人资料。可导入 JSON，或从下方开始填写。");
  const [dirty, setDirty] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const preparation = buildPreparation(workspace);

  function update(change: (current: PreparationWorkspace) => PreparationWorkspace) {
    setWorkspace(change);
    setDirty(true);
    setNotice("有未保存的修改。点击“保存到此浏览器”后，刷新可恢复。");
    setErrors([]);
  }

  function updateFact(id: string, patch: Partial<Fact>) {
    update((current) => ({ ...current, profile: { ...current.profile, facts: current.profile.facts.map((fact) => fact.id === id ? { ...fact, ...patch } : fact) } }));
  }

  function updateStory(id: string, patch: Partial<Story>) {
    update((current) => ({ ...current, profile: { ...current.profile, stories: current.profile.stories.map((story) => story.id === id ? { ...story, ...patch } : story) } }));
  }

  function importJson(raw: string) {
    const result = parseWorkspace(raw);
    if (!result.ok) {
      setErrors(result.errors);
      setNotice("导入失败；现有资料未改变。");
      return;
    }
    setWorkspace(result.value);
    setJsonInput("");
    setDirty(true);
    setErrors([]);
    setNotice("已导入到当前页面。确认后保存到此浏览器；导入内容尚未覆盖本地记录。");
  }

  function save() {
    const result = validateWorkspace(workspace);
    if (!result.ok) { setErrors(result.errors); return; }
    try {
      localStorage.setItem(STORAGE_KEY, serializeWorkspace(result.value));
      setDirty(false);
      setErrors([]);
      setNotice("已保存到此浏览器。刷新后会恢复；没有上传个人资料。");
    } catch {
      setErrors(["保存失败：浏览器存储被禁用或容量不足。请导出 JSON 保留当前资料。"]);
    }
  }

  function exportJson() {
    const result = validateWorkspace(workspace);
    if (!result.ok) { setErrors(result.errors); return; }
    const blob = new Blob([serializeWorkspace(result.value)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "interview-preparation-v1.json";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setErrors([]);
    setNotice("已生成本地 JSON 下载。文件包含私密资料，请自行保管。");
  }

  function clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setWorkspace(createEmptyWorkspace());
      setJsonInput("");
      setDirty(false);
      setErrors([]);
      setConfirmClear(false);
      setNotice("已清除此页面和此浏览器保存的备考资料。已下载的 JSON 文件仍保留。");
    } catch {
      setErrors(["浏览器未允许删除本地记录，无法确认清除成功。"]);
    }
  }

  return (
    <div className="mt-8 space-y-10">
      <section aria-labelledby="local-data-heading" className="rounded border border-line bg-surface p-5 sm:p-7">
        <h2 id="local-data-heading" className="text-xl font-semibold text-ink">本地资料</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-body">个人资料只在浏览器中读取、编辑和保存。文件导入、回答整理与导出均在本机完成。浏览器保存的内容可被此浏览器使用者与同源脚本访问；导出 JSON 未加密。</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className={primary} type="button" onClick={save}>保存到此浏览器{dirty ? " *" : ""}</button>
          <button className={button} type="button" onClick={exportJson}>导出 JSON</button>
          <button className={button} type="button" onClick={() => setConfirmClear(true)}>清除本地资料</button>
        </div>
        {confirmClear ? <div className="mt-4 rounded border border-line bg-background p-4">
          <p className="text-sm text-body">确认清除所有个人事实、故事与岗位设置？已下载的 JSON 不会被删除。</p>
          <div className="mt-3 flex gap-3"><button className={button} type="button" onClick={clear}>确认清除</button><button className={button} type="button" onClick={() => setConfirmClear(false)}>取消</button></div>
        </div> : null}
        <p role="status" aria-live="polite" className="mt-4 text-sm leading-6 text-teaching">{notice}</p>
        {errors.length ? <div role="alert" className="mt-4 rounded border border-line bg-background p-4 text-sm text-ink"><p className="font-semibold">请检查：</p><ul className="mt-2 list-disc space-y-1 pl-5">{errors.map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}</ul></div> : null}
        <details className="mt-5 border-t border-line pt-4">
          <summary className="cursor-pointer text-sm font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand">导入本地 JSON（替换当前页面资料）</summary>
          <div className="mt-4 space-y-4">
            <Field label="选择 JSON 文件"><input className={control} type="file" accept="application/json,.json" onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              if (file.size > 4_000_000) { setErrors(["文件过大，请使用不超过 4 MB 的 JSON 文件。"]); return; }
              try { importJson(await file.text()); } catch { setErrors(["无法读取此文件，请重新选择或粘贴 JSON。"]); }
            }} /></Field>
            <Field label="或粘贴 JSON"><textarea className={`${control} font-mono`} rows={6} value={jsonInput} onChange={(event) => setJsonInput(event.target.value)} /></Field>
            <button className={button} type="button" onClick={() => importJson(jsonInput)}>校验并导入</button>
          </div>
        </details>
      </section>

      <section id="role-context" aria-labelledby="role-heading">
        <h2 id="role-heading" className="text-2xl font-semibold text-ink">01 · 这次面试</h2>
        <p className="mt-2 text-sm leading-6 text-muted">公司与岗位用于本次准备。切换侧重点只调整回答排序、转场与追问，个人事实保持原样。</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-body">
          <li>公司变化：调整 Why this company、已核实的业务关注与反问。具体动机由你在下方填写。</li>
          <li>岗位变化：调整自介和项目的强调顺序、技术追问与解释深度。</li>
          <li>保持不变：经历事实、实际贡献与来源。公司名称不会被用来推断业务或求职动机。</li>
        </ul>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="公司"><input className={control} value={workspace.context.company} onChange={(event) => update((current) => ({ ...current, context: { ...current.context, company: event.target.value } }))} /></Field>
          <Field label="岗位"><input className={control} value={workspace.context.roleTitle} onChange={(event) => update((current) => ({ ...current, context: { ...current.context, roleTitle: event.target.value } }))} /></Field>
          <Field label="岗位侧重点"><select className={control} value={workspace.context.focus} onChange={(event) => update((current) => ({ ...current, context: { ...current.context, focus: event.target.value as Focus } }))}>{Object.entries(roleTemplates).map(([value, template]) => <option key={value} value={value}>{template.label}</option>)}</select></Field>
          <Field label="面试日期"><input className={control} type="date" value={workspace.context.interviewDate} onChange={(event) => update((current) => ({ ...current, context: { ...current.context, interviewDate: event.target.value } }))} /></Field>
        </div>
        <div className="mt-5"><Field label="JD 要点 / 招聘方待确认事项"><textarea className={control} rows={3} value={workspace.context.notes} onChange={(event) => update((current) => ({ ...current, context: { ...current.context, notes: event.target.value } }))} /></Field></div>
      </section>

      <section id="profile" aria-labelledby="facts-heading">
        <h2 id="facts-heading" className="text-2xl font-semibold text-ink">02 · 我的事实</h2>
        <p className="mt-2 text-sm leading-6 text-muted">只有“用户确认”或“代码证据”的个人贡献进入英文回答。团队流程与背景单独展示，待核实内容保留来源。</p>
        <div className="mt-5 max-w-md"><Field label="称呼 / 英文名"><input className={control} value={workspace.profile.displayName} onChange={(event) => update((current) => ({ ...current, profile: { ...current.profile, displayName: event.target.value } }))} /></Field></div>
        <div className="mt-5 space-y-3">{workspace.profile.facts.map((fact, index) => <FactEditor key={fact.id} fact={fact} index={index} onChange={(patch) => updateFact(fact.id, patch)} onRemove={() => update((current) => ({ ...current, profile: { ...current.profile, facts: current.profile.facts.filter((item) => item.id !== fact.id), stories: current.profile.stories.map((story) => ({ ...story, factIds: story.factIds.filter((id) => id !== fact.id) })) } }))} />)}</div>
        <button className={`${button} mt-4`} type="button" onClick={() => {
          const fact: Fact = { id: crypto.randomUUID(), text: "", tags: [], provenance: "needs-review", contribution: "context", source: "" };
          update((current) => ({ ...current, profile: { ...current.profile, facts: [...current.profile.facts, fact] } }));
        }}>添加事实</button>
      </section>

      <section id="stories" aria-labelledby="stories-heading">
        <h2 id="stories-heading" className="text-2xl font-semibold text-ink">03 · 项目故事</h2>
        <p className="mt-2 text-sm leading-6 text-muted">把同一项目的动作、结果与背景事实关联起来。调整岗位时，关联与事实原文都不改变。</p>
        <div className="mt-5 space-y-3">{workspace.profile.stories.map((story) => <StoryEditor key={story.id} story={story} facts={workspace.profile.facts} onChange={(patch) => updateStory(story.id, patch)} onRemove={() => update((current) => ({ ...current, profile: { ...current.profile, stories: current.profile.stories.filter((item) => item.id !== story.id) } }))} />)}</div>
        <button className={`${button} mt-4`} type="button" onClick={() => {
          const story: Story = { id: crypto.randomUUID(), title: "", factIds: [], reflection: "" };
          update((current) => ({ ...current, profile: { ...current.profile, stories: [...current.profile.stories, story] } }));
        }}>添加故事</button>
      </section>

      <section id="rehearsal" aria-labelledby="rehearsal-heading" className="border-t border-line pt-8">
        <p className="font-mono text-sm text-brand">{preparation.template.label}</p>
        <h2 id="rehearsal-heading" className="mt-2 text-2xl font-semibold text-ink">04 · 开口练习</h2>
        <p className="mt-3 text-sm leading-6 text-body">{preparation.template.emphasis}</p>
        <p className="mt-2 text-sm text-muted">以下按标签整理已记录事实，未调用 AI，也不会新增业绩或技术经验。当前可使用 {preparation.confirmedCount} 条个人事实。</p>
        <article className="mt-6 rounded border border-line p-5">
          <h3 className="font-semibold text-ink">{workspace.context.company ? `${workspace.context.company} · ` : ""}Why this company / HR 核对</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-body">{workspace.context.notes || "待填写：我为何对这家公司的具体岗位感兴趣？JD 中哪些信息已核实？哪些团队、雇佣地点或流程问题需要问 HR？"}</p>
          <p className="mt-3 text-xs leading-6 text-muted">这是你填写的公司与岗位笔记，仍需自己核实；不会自动转换为个人工作经历。</p>
        </article>
        <article className="mt-6 rounded border-l-4 border-brand bg-surface p-5">
          <h3 className="font-semibold text-ink">英文自我介绍草稿</h3>
          <p lang="en" className="mt-3 whitespace-pre-wrap text-base leading-8 text-body">{preparation.introduction}</p>
        </article>
        {preparation.stories.map((story) => <article key={story.id} className="mt-5 rounded border border-line p-5">
          <h3 className="text-lg font-semibold text-ink">{story.title || "尚未命名的项目故事"}</h3>
          <p lang="en" className="mt-3 whitespace-pre-wrap text-base leading-8 text-body">{story.answer}</p>
          <p className="mt-3 text-xs text-muted">已纳入 {story.includedFactIds.length} 条个人事实；{story.excludedCount} 条团队、背景或待核实事实未进入第一人称回答。</p>
          {story.reflection ? <div className="mt-4 border-t border-line pt-4"><h4 className="text-sm font-semibold text-teaching">我的复盘笔记</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-body">{story.reflection}</p></div> : null}
        </article>)}
        <div className="mt-6 rounded border-l-4 border-teaching bg-teaching-soft p-5">
          <h3 className="font-semibold text-ink">这个方向的追问</h3>
          <ol lang="en" className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-7 text-body">{preparation.template.questions.map((question) => <li key={question}>{question}</li>)}</ol>
        </div>
        <details className="mt-5 rounded border border-line p-5">
          <summary className="cursor-pointer text-sm font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand">核对团队背景、证据与待确认事实</summary>
          {workspace.profile.facts.filter((fact) => fact.contribution !== "personal" || fact.provenance === "needs-review").map((fact) => <div key={fact.id} className="mt-4 border-t border-line pt-4"><p className="text-xs font-semibold text-muted">{provenanceLabels[fact.provenance]} · {contributionLabels[fact.contribution]}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-body">{fact.text}</p><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-muted">来源：{fact.source || "尚未记录"}</p></div>)}
        </details>
      </section>
    </div>
  );
}

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function PreparationWorkspacePage() {
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  return hydrated
    ? <WorkspaceEditor />
    : <p role="status" className="mt-8 text-sm text-muted">正在打开浏览器本地备考工作区……</p>;
}
