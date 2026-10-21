"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { DocumentConflict, loadPrivateDocument, savePrivateDocument, type PrivateDocument } from "./client";
import { mergeProgress, progressEqual } from "./merge";
import { emptyProgress, parseLearningProgress, STUDIO_KEYS, validateStudioProgress, type LearningStatus, type ProgressDocument, type StudioKey, type StudioProgress } from "./model";

type SyncState = "guest" | "loading" | "saved" | "saving" | "error" | "conflict";
type Snapshot = { document: ProgressDocument; syncState: SyncState; error: string | null };
type PendingConflict = { latest: PrivateDocument<ProgressDocument>; original: ProgressDocument };
type ProgressContextValue = Snapshot & {
  ready: boolean;
  runtimeRevision: number;
  authenticated: boolean;
  setStatus: (questionId: string, status: LearningStatus) => void;
  setStudioProgress: (key: StudioKey, value: Record<string, import("./model").JsonValue>) => void;
  retry: () => void;
  resolveConflict: (choice: "local" | "remote") => void;
};
const ProgressContext = createContext<ProgressContextValue | null>(null);

export function LearningProvider({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) {
  const [snapshot, setSnapshot] = useState<Snapshot>({ document: emptyProgress(), syncState: "loading", error: null });
  const [ready, setReady] = useState(false);
  const [runtimeRevision, setRuntimeRevision] = useState(0);
  const current = useRef(emptyProgress());
  const base = useRef<PrivateDocument<ProgressDocument> | null>(null);
  const runtime = useRef<StudioProgress>({});
  const running = useRef(false);
  const disposed = useRef(false);
  const conflict = useRef<PendingConflict | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async (keepalive = false) => {
    if (!enabled || running.current || !base.current || conflict.current || disposed.current) return;
    running.current = true;
    try {
      let conflictsRetried = 0;
      while (base.current && !conflict.current && !progressEqual(current.current, base.current.content)) {
        const original: PrivateDocument<ProgressDocument> = base.current;
        const writing = current.current;
        try {
          const small: boolean = new Blob([JSON.stringify({ content: writing, expectedVersion: original.version })]).size < 60_000;
          const saved: PrivateDocument<ProgressDocument> = await savePrivateDocument("progress", writing, original.version, { keepalive: keepalive && small });
          base.current = { ...saved, content: parseLearningProgress(saved.content) };
          if (disposed.current) return;
          const pending = conflict.current as PendingConflict | null;
          if (pending) { pending.latest = base.current; return; }
        } catch (error) {
          if (!(error instanceof DocumentConflict)) throw error;
          const latest = await loadPrivateDocument<ProgressDocument>("progress");
          latest.content = parseLearningProgress(latest.content);
          const pending = conflict.current as PendingConflict | null;
          if (pending) { pending.latest = latest; return; }
          const merged = mergeProgress(original.content, current.current, latest.content);
          current.current = merged.document;
          if (merged.conflicts.length || ++conflictsRetried > 2) {
            conflict.current = { latest, original: original.content };
            setSnapshot({ document: current.current, syncState: "conflict", error: "另一页面修改了同一项记录。本页内容仍保留，请选择要保留的版本。" });
            return;
          }
          base.current = latest;
        }
      }
      if (!disposed.current && !conflict.current) setSnapshot({ document: current.current, syncState: "saved", error: null });
    } catch (error) {
      if (!disposed.current) setSnapshot({ document: current.current, syncState: "error", error: error instanceof Error ? error.message : "同步失败；本页修改仍保留。" });
    } finally { running.current = false; }
  }, [enabled]);

  const schedule = useCallback((document: ProgressDocument) => {
    current.current = document;
    setSnapshot({ document, syncState: conflict.current ? "conflict" : "saving", error: conflict.current ? "存在版本冲突；本页修改仍保留。" : null });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { void flush(); }, 600);
  }, [flush]);

  useEffect(() => {
    if (!enabled) return;
    disposed.current = false;
    let cancelled = false;
    void loadPrivateDocument<ProgressDocument>("progress").then((loaded) => {
      const document = parseLearningProgress(loaded.content);
      if (cancelled) return;
      base.current = { ...loaded, content: document };
      const migrated: StudioProgress = { ...document.studio };
      // Read old browser data only after the owner-only endpoint authorizes us.
      for (const key of STUDIO_KEYS) {
        if (migrated[key] !== undefined) continue;
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const value: unknown = JSON.parse(raw);
            if (validateStudioProgress({ [key]: value })) migrated[key] = value as Record<string, import("./model").JsonValue>;
          }
        } catch { /* An unreadable legacy record does not replace cloud progress. */ }
      }
      current.current = { ...document, studio: migrated };
      runtime.current = migrated;
      setReady(true);
      if (!progressEqual(document.studio, migrated)) schedule(current.current);
      else setSnapshot({ document, syncState: "saved", error: null });
    }).catch((error: unknown) => {
      if (!cancelled) setSnapshot({ document: current.current, syncState: "error", error: error instanceof Error ? error.message : "读取失败。" });
    });
    return () => { cancelled = true; disposed.current = true; if (timer.current) clearTimeout(timer.current); };
  }, [enabled, schedule]);

  useEffect(() => {
    if (!enabled) return;
    const visibility = () => { if (document.visibilityState === "hidden") void flush(true); };
    const leaving = (event: BeforeUnloadEvent) => {
      if (base.current && !progressEqual(current.current, base.current.content)) {
        void flush(true);
        event.preventDefault();
        event.returnValue = "";
      }
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("beforeunload", leaving);
    return () => { document.removeEventListener("visibilitychange", visibility); window.removeEventListener("beforeunload", leaving); };
  }, [enabled, flush]);

  const setStatus = useCallback((questionId: string, status: LearningStatus) => {
    if (!enabled || !base.current || !questionId) return;
    schedule({ ...current.current, questions: { ...current.current.questions, [questionId]: { status, updatedAt: new Date().toISOString() } } });
  }, [enabled, schedule]);

  const setStudioProgress = useCallback((key: StudioKey, value: Record<string, import("./model").JsonValue>) => {
    if (!enabled || !base.current || !validateStudioProgress({ [key]: value })) return;
    const before = { ...current.current, studio: { ...current.current.studio, [key]: runtime.current[key] ?? current.current.studio[key] } };
    const incoming = { ...before, studio: { ...before.studio, [key]: value } };
    const merged = mergeProgress(before, incoming, current.current);
    runtime.current = { ...runtime.current, [key]: value };
    if (merged.conflicts.length && !conflict.current) conflict.current = { latest: base.current, original: before };
    schedule(merged.document);
  }, [enabled, schedule]);

  const retry = useCallback(() => { if (!base.current) window.location.reload(); else void flush(); }, [flush]);
  const resolveConflict = useCallback((choice: "local" | "remote") => {
    if (!conflict.current) return;
    const { latest, original } = conflict.current;
    const chosen = choice === "remote"
      ? mergeProgress(original, current.current, latest.content, "remote").document
      : current.current;
    conflict.current = null;
    base.current = latest;
    current.current = chosen;
    if (choice === "remote") { runtime.current = chosen.studio; setRuntimeRevision((value) => value + 1); }
    if (progressEqual(chosen, latest.content)) setSnapshot({ document: chosen, syncState: "saved", error: null });
    else schedule(chosen);
  }, [schedule]);

  const visible = enabled ? snapshot : { document: emptyProgress(), syncState: "guest" as const, error: null };
  return <ProgressContext.Provider value={{ ...visible, authenticated: enabled, ready: enabled && ready, runtimeRevision, setStatus, setStudioProgress, retry, resolveConflict }}>{children}</ProgressContext.Provider>;
}

function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error("LearningProvider is required for private learning progress.");
  return value;
}

export function useLearningProgress(questionId: string) {
  const value = useProgress();
  return { status: value.document.questions[questionId]?.status ?? null, authenticated: value.authenticated, ready: value.ready, setStatus: (status: LearningStatus) => value.setStatus(questionId, status), syncState: value.syncState, error: value.error, retry: value.retry, resolveConflict: value.resolveConflict };
}

export function useProgressSummary() {
  const value = useProgress();
  const counts = { learning: 0, review: 0, confident: 0 };
  for (const question of Object.values(value.document.questions)) counts[question.status]++;
  return { questions: value.document.questions, counts, authenticated: value.authenticated, ready: value.ready, syncState: value.syncState, error: value.error, retry: value.retry, resolveConflict: value.resolveConflict };
}

export function useStudioProgress() {
  const value = useProgress();
  return { progress: value.document.studio, ready: value.ready, runtimeRevision: value.runtimeRevision, setProgress: value.setStudioProgress, syncState: value.syncState, error: value.error, retry: value.retry, resolveConflict: value.resolveConflict };
}
