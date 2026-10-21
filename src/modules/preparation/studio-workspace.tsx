"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { parseStudioBundle, STUDIO_PROGRESS_KEYS, STUDIO_STORAGE_KEY, type StudioBundle } from "./studio-model";
import { DocumentConflict, loadPrivateDocument, savePrivateDocument, useStudioProgress, validateStudioProgress, type StudioKey, type JsonValue } from "../learning";

const button = "ui-button";

function StudioEditor() {
  const [bundle, setBundle] = useState<StudioBundle | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("正在载入你的私人题库…");
  const [revision, setRevision] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const contentVersion = useRef<number | null>(null);
  const progress = useStudioProgress();

  useEffect(() => {
    let cancelled = false;
    void loadPrivateDocument<unknown>("studio").then((document) => {
      const loaded = parseStudioBundle(JSON.stringify(document.content));
      if (cancelled) return;
      contentVersion.current = document.version;
      setBundle(loaded);
      setNotice("私人题库已载入。");
    }).catch((failure: unknown) => {
      if (!cancelled) setError(failure instanceof Error ? failure.message : "读取 Studio 失败。");
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function receive(event: MessageEvent) {
      if (event.source !== frame.current?.contentWindow || event.origin !== location.origin) return;
      if (event.data?.type === "interview-studio:ready" && bundle && progress.ready) {
        frame.current?.contentWindow?.postMessage({ type: "interview-studio:load", data: bundle, progress: progress.progress, section: location.hash === "#foundations" ? "foundations" : "behavior" }, location.origin);
      }
      if (event.data?.type === "interview-studio:loaded") setNotice("私人练习已打开。");
      if (event.data?.type === "interview-studio:progress" && STUDIO_PROGRESS_KEYS.includes(event.data.key)
        && validateStudioProgress({ [event.data.key]: event.data.value })) {
        progress.setProgress(event.data.key as StudioKey, event.data.value as Record<string, JsonValue>);
      }
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [bundle, progress]);

  useEffect(() => {
    const selectSection = () => {
      if (["#behavior", "#foundations"].includes(location.hash)) frame.current?.contentWindow?.postMessage({ type: "interview-studio:select", section: location.hash.slice(1) }, location.origin);
    };
    window.addEventListener("hashchange", selectSection);
    return () => window.removeEventListener("hashchange", selectSection);
  }, []);

  function download() {
    if (!bundle) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "interview-studio-private.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const syncLabel = error || progress.error ? "同步需要处理" : !bundle || !progress.ready || progress.syncState === "loading"
    ? "正在载入你的私人题库…" : progress.syncState === "saving" ? "正在保存练习进度…"
      : progress.syncState === "saved" ? "练习进度已保存到你的账号" : "正在准备私人练习…";

  return <>
    <section className="mx-auto max-w-6xl px-6 pb-7 sm:px-10" aria-labelledby="studio-data-heading">
      <div className="ui-card p-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
          <div><h2 id="studio-data-heading" className="text-sm font-semibold text-ink">Your practice library</h2>
            {bundle ? <p className="mt-1 text-xs leading-6 text-muted">{bundle.behavior.stories.length} stories · {bundle.behavior.questions.length} behavioral questions · {bundle.foundations.questions.length} foundations</p> : null}
          </div>
          <p role="status" className={`text-xs leading-6 ${error || progress.error ? "text-[#9a5737]" : "text-muted"}`}>{syncLabel}</p>
        </div>
        {error ? <p role="alert" className="mt-3 text-sm leading-6 text-red-700">{error}</p> : null}
        {progress.error ? <p role="alert" className="mt-3 text-sm leading-6 text-red-700">{progress.error}</p> : null}
        {progress.syncState === "error" ? <button className={`${button} mt-3`} onClick={progress.retry}>重试同步进度</button> : null}
        {progress.syncState === "conflict" ? <div className="mt-3 flex flex-wrap gap-3"><button className={button} onClick={() => progress.resolveConflict("local")}>同项冲突保留本页</button><button className={button} onClick={() => progress.resolveConflict("remote")}>同项冲突保留云端</button></div> : null}
        <details className="mt-3 border-t border-line pt-3">
          <summary className="cursor-pointer text-xs font-medium text-muted outline-none focus-visible:ring-2 focus-visible:ring-brand">备份与旧版记录（可选）</summary>
          <p className="mt-3 text-xs leading-6 text-muted">正常练习无需导入文件。只有备份、替换题库或迁移旧版记录时，才需要下面的选项。</p>
        <label className="mt-4 block text-sm font-semibold text-ink">导入 Studio 资料包（JSON）
          <input className="mt-2 block w-full text-sm file:mr-3 file:rounded file:border file:border-line file:bg-background file:px-3 file:py-2" type="file" accept=".json,application/json" onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
              if (file.size > 2_000_000) throw new Error("资料包超过 2 MB 限制。");
              const imported = parseStudioBundle(await file.text());
              setBundle(imported); setRevision((current) => current + 1); setError("");
              setNotice("已导入到当前页面，尚未覆盖云端资料。请保存以便下次恢复。");
            } catch (failure) { setError(failure instanceof Error ? failure.message : "导入失败；原资料保留。"); }
            event.target.value = "";
          }} />
        </label>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className={button} disabled={!bundle} onClick={async () => {
            if (!bundle || contentVersion.current === null) return;
            try {
              const saved = await savePrivateDocument("studio", bundle, contentVersion.current);
              contentVersion.current = saved.version;
              setNotice("已保存 Studio 资料到私人空间。"); setError("");
            } catch (failure) {
              setError(failure instanceof DocumentConflict ? "Studio 已在另一页面更新；本页内容仍保留。请先导出本页资料，再重新载入，避免覆盖其他修改。" : failure instanceof Error ? failure.message : "保存失败；仍可导出本页资料。");
            }
          }}>保存 Studio 资料</button>
          <button className={button} disabled={!bundle} onClick={download}>导出 Studio 资料</button>
          <button className={button} onClick={() => setConfirmClear(true)}>清除此浏览器的旧缓存</button>
        </div>
        {confirmClear ? <div className="mt-4 rounded border border-line bg-background p-4"><p className="text-sm leading-6 text-body">清除此浏览器旧版 Studio 缓存。云端资料与进度保留，重新载入后可恢复。导出的文件仍需自行保管。</p><div className="mt-3 flex gap-3"><button className={button} onClick={() => {
          try {
            const player = frame.current?.contentWindow as (Window & { disposeStudio?: () => void }) | null;
            if (player && !player.disposeStudio) throw new Error("Studio is still loading.");
            player?.disposeStudio?.();
            [STUDIO_STORAGE_KEY, ...STUDIO_PROGRESS_KEYS].forEach((key) => localStorage.removeItem(key));
            setRevision((current) => current + 1); setConfirmClear(false); setError(""); setNotice("已清除旧缓存；私人云端资料和进度保留。");
          } catch { setError("未能清除浏览器存储，请使用浏览器站点数据设置。"); }
        }}>确认清除旧缓存</button><button className={button} onClick={() => setConfirmClear(false)}>取消</button></div></div> : null}
          <p role="status" className="mt-4 text-xs leading-6 text-muted">{notice}</p>
          <p className="mt-3 text-xs leading-6 text-muted">如需保留旧 HTML 的作答记录，先从旧页面 Export progress，再在练习中的 Preparation notes 或 Sources / Weak areas 导入。浏览器无法自动读取旧 file:// 页面保存的记录。</p>
        </details>
      </div>
    </section>
    {bundle && progress.ready ? <iframe key={`${revision}:${progress.runtimeRevision}`} ref={frame} src="/studio/index.html" title="Private Interview Studio" className="block w-full border-y border-line" style={{ height: "calc(100dvh - 4rem)", minHeight: 640 }} onLoad={() => {
      frame.current?.contentWindow?.postMessage({ type: "interview-studio:load", data: bundle, progress: progress.progress, section: location.hash === "#foundations" ? "foundations" : "behavior" }, location.origin);
    }} /> : <p role="status" className="mx-auto max-w-6xl px-6 pb-16 text-sm leading-7 text-muted sm:px-10">{error || progress.error ? "暂时无法打开练习，请查看上方提示。" : "正在载入你的私人题库…"}</p>}
  </>;
}

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function StudioWorkspace() {
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  return hydrated ? <StudioEditor /> : <p role="status" className="px-6 py-8 text-sm text-muted">正在打开私人练习…</p>;
}
