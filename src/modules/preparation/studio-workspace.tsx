"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { parseStudioBundle, STUDIO_PROGRESS_KEYS, STUDIO_STORAGE_KEY, type StudioBundle } from "./studio-model";

const button = "rounded border border-line bg-background px-4 py-2 text-sm font-semibold text-ink hover:border-brand focus-visible:outline-2 focus-visible:outline-brand";

function readSaved() {
  try {
    const raw = localStorage.getItem(STUDIO_STORAGE_KEY);
    return { bundle: raw ? parseStudioBundle(raw) : null, error: "" };
  } catch {
    return { bundle: null, error: "未能恢复 Studio 资料；原记录已保留。可以重新导入本地备份。" };
  }
}

function StudioEditor() {
  const [initial] = useState(readSaved);
  const [bundle, setBundle] = useState<StudioBundle | null>(initial.bundle);
  const [error, setError] = useState(initial.error);
  const [notice, setNotice] = useState(initial.bundle ? "已恢复此浏览器的 Studio 资料。" : "首次使用请导入本地 Studio 资料包。原 HTML 的故事与练习会在下面打开。");
  const [revision, setRevision] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function receive(event: MessageEvent) {
      if (event.source !== frame.current?.contentWindow || event.origin !== location.origin) return;
      if (event.data?.type === "interview-studio:ready" && bundle) {
        frame.current?.contentWindow?.postMessage({ type: "interview-studio:load", data: bundle }, location.origin);
      }
      if (event.data?.type === "interview-studio:loaded") setNotice("Studio 已打开。题库留在当前页面；点击保存后，下次可直接恢复。");
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [bundle]);

  function download() {
    if (!bundle) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "interview-studio-private.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <>
    <section className="mx-auto max-w-6xl px-6 pb-7 sm:px-10" aria-labelledby="studio-data-heading">
      <div className="rounded border border-line bg-surface p-5">
        <h2 id="studio-data-heading" className="text-lg font-semibold text-ink">已有资料 · 浏览器本地读取</h2>
        <p className="mt-2 text-sm leading-7 text-body">导入后保留原来的 Six stories、STAR、英文口述、Introduction、计时练习、基础课、测验与薄弱项。文件不上传；已确认内容与待补事实沿用原标记。资料和进度未加密，不跨设备同步。</p>
        <label className="mt-4 block text-sm font-semibold text-ink">导入 Studio 资料包（JSON）
          <input className="mt-2 block w-full text-sm file:mr-3 file:rounded file:border file:border-line file:bg-background file:px-3 file:py-2" type="file" accept=".json,application/json" onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
              if (file.size > 2_000_000) throw new Error("资料包超过 2 MB 限制。");
              const imported = parseStudioBundle(await file.text());
              setBundle(imported); setRevision((current) => current + 1); setError("");
              setNotice("已导入到当前页面，尚未覆盖浏览器保存的资料。请保存以便下次恢复。");
            } catch (failure) { setError(failure instanceof Error ? failure.message : "导入失败；原资料保留。"); }
            event.target.value = "";
          }} />
        </label>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className={button} disabled={!bundle} onClick={() => {
            try { localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(bundle)); setNotice("已保存 Studio 资料到此浏览器。"); setError(""); }
            catch { setError("浏览器未能保存资料。仍可在当前页面练习并导出。"); }
          }}>保存 Studio 资料</button>
          <button className={button} disabled={!bundle} onClick={download}>导出 Studio 资料</button>
          <button className={button} onClick={() => setConfirmClear(true)}>清除 Studio 本地资料和进度</button>
        </div>
        {confirmClear ? <div className="mt-4 rounded border border-line bg-background p-4"><p className="text-sm leading-6 text-body">清除此浏览器的 Studio 题库、草稿和练习进度；个人 profile 保留。导出的文件仍需自行保管。</p><div className="mt-3 flex gap-3"><button className={button} onClick={() => {
          try {
            const player = frame.current?.contentWindow as (Window & { disposeStudio?: () => void }) | null;
            if (player && !player.disposeStudio) throw new Error("Studio is still loading.");
            player?.disposeStudio?.();
            [STUDIO_STORAGE_KEY, ...STUDIO_PROGRESS_KEYS].forEach((key) => localStorage.removeItem(key));
            setBundle(null); setRevision((current) => current + 1); setConfirmClear(false); setError(""); setNotice("已清除 Studio 本地资料和进度。");
          } catch { setError("未能清除浏览器存储，请使用浏览器站点数据设置。"); }
        }}>确认清除 Studio</button><button className={button} onClick={() => setConfirmClear(false)}>取消</button></div></div> : null}
        <p role="status" className="mt-4 text-sm leading-6 text-teaching">{notice}</p>
        {error ? <p role="alert" className="mt-3 text-sm leading-6 text-red-700">{error}</p> : null}
        {bundle ? <p className="mt-3 font-mono text-sm text-muted">{bundle.behavior.questions.length} behavioral questions · {bundle.behavior.stories.length} stories · {bundle.foundations.questions.length} foundation questions · {bundle.foundations.modules.length} modules</p> : null}
      </div>
    </section>
    {bundle ? <iframe key={revision} ref={frame} src="/studio/index.html" title="Private Interview Studio" className="block w-full border-y border-line" style={{ height: "calc(100dvh - 4rem)", minHeight: 640 }} onLoad={() => {
      frame.current?.contentWindow?.postMessage({ type: "interview-studio:load", data: bundle }, location.origin);
    }} /> : <p className="mx-auto max-w-6xl px-6 pb-16 text-sm leading-7 text-muted sm:px-10">需要保留旧 HTML 的作答记录时，先从旧页面 Export progress，再在这里对应的 Preparation notes 或 Sources / Weak areas 导入。浏览器无法自动读取旧 file:// 页面保存的记录。</p>}
  </>;
}

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function StudioWorkspace() {
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  return hydrated ? <StudioEditor /> : <p role="status" className="px-6 py-8 text-sm text-muted">正在打开浏览器本地 Studio……</p>;
}
