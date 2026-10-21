"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DocumentConflict, loadPrivateDocument, savePrivateDocument, type PrivateDocument } from "../learning/client";

type Key = "profile" | "studio";
type Snapshot<T> = { key: Key; document: T | null; version: number | null; loading: boolean; saving: boolean; error: string | null };

function parsedDocument<T>(response: PrivateDocument<unknown>, key: Key, parse: (input: unknown) => T) {
  if (response.key !== key || !Number.isSafeInteger(response.version) || response.version < 1) {
    throw new Error("云端资料版本无效，现有内容未改变。");
  }
  return { document: parse(response.content), version: response.version };
}

export function usePrivateDocument<T>(key: Key, parse: (input: unknown) => T) {
  const [snapshot, setSnapshot] = useState<Snapshot<T>>({ key, document: null, version: null, loading: true, saving: false, error: null });
  const active = useRef(true);
  const request = useRef(0);
  const writing = useRef(false);
  const reading = useRef(true);
  const base = useRef<{ key: Key; version: number } | null>(null);

  useEffect(() => {
    active.current = true;
    reading.current = true;
    const sequence = ++request.current;
    void loadPrivateDocument<unknown>(key).then((response) => {
      const loaded = parsedDocument(response, key, parse);
      if (!active.current || request.current !== sequence) return;
      base.current = { key, version: loaded.version };
      setSnapshot({ key, ...loaded, loading: false, saving: false, error: null });
    }).catch((error: unknown) => {
      if (active.current && request.current === sequence) setSnapshot({ key, document: null, version: null, loading: false, saving: false, error: error instanceof Error ? error.message : "未能读取私人资料。" });
    }).finally(() => { if (request.current === sequence) reading.current = false; });
    return () => { active.current = false; };
  }, [key, parse]);

  const reload = useCallback(async (): Promise<boolean> => {
    if (writing.current || reading.current) return false;
    reading.current = true;
    const sequence = ++request.current;
    setSnapshot((current) => ({ ...current, loading: true, error: null }));
    try {
      const loaded = parsedDocument(await loadPrivateDocument<unknown>(key), key, parse);
      if (!active.current || sequence !== request.current) return false;
      base.current = { key, version: loaded.version };
      setSnapshot({ key, ...loaded, loading: false, saving: false, error: null });
      return true;
    } catch (error) {
      if (active.current && sequence === request.current) setSnapshot((current) => ({ ...current, loading: false, error: error instanceof Error ? error.message : "重新读取失败；本页修改仍保留。" }));
      return false;
    } finally { if (sequence === request.current) reading.current = false; }
  }, [key, parse]);

  const save = useCallback(async (content: T): Promise<boolean> => {
    if (writing.current || reading.current || !base.current || base.current.key !== key) return false;
    const expectedVersion = base.current.version;
    const sequence = request.current;
    writing.current = true;
    setSnapshot((current) => ({ ...current, saving: true, error: null }));
    try {
      const saved = parsedDocument(await savePrivateDocument(key, parse(content), expectedVersion), key, parse);
      if (!active.current || sequence !== request.current) return false;
      base.current = { key, version: saved.version };
      setSnapshot({ key, ...saved, loading: false, saving: false, error: null });
      return true;
    } catch (error) {
      if (active.current && sequence === request.current) setSnapshot((current) => ({
        ...current, saving: false,
        error: error instanceof DocumentConflict
          ? "云端资料已在其他页面更新。本页草稿仍保留，尚未覆盖云端。请先备份草稿，再主动重新载入云端版本。"
          : error instanceof Error ? error.message : "保存失败；本页草稿仍保留。",
      }));
      return false;
    } finally { writing.current = false; }
  }, [key, parse]);

  const visible = snapshot.key === key ? snapshot : { key, document: null, version: null, loading: true, saving: false, error: null };
  return { document: visible.document, loading: visible.loading, error: visible.error, saving: visible.saving, save, reload, version: visible.version };
}
