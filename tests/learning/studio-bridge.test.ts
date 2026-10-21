import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

test("Studio cloud relay accepts only its same-origin parent and never accesses local storage", () => {
  const origin = "https://synthetic.example";
  const messages: { value: { type: string; key?: string }; targetOrigin: string }[] = [];
  const nodes = new Map<string, { textContent?: string; hidden?: boolean }>();
  let storageReads = 0;
  let storageWrites = 0;
  let listener: (event: unknown) => void = () => {};
  let mounts = 0;
  const parent = { postMessage: (value: { type: string; key?: string }, targetOrigin: string) => messages.push({ value, targetOrigin }) };
  const window = {
    location: { origin }, parent,
    addEventListener: (_type: string, callback: typeof listener) => { listener = callback; },
    startStudio: () => { mounts++; },
    KIT: {} as { read: (key: string, fallback: unknown) => unknown; write: (key: string, value: unknown) => void; disablePersistence: () => void },
  };
  const context = {
    window,
    localStorage: { getItem: () => { storageReads++; return null; }, setItem: () => { storageWrites++; } },
    document: { querySelector: (selector: string) => { if (!nodes.has(selector)) nodes.set(selector, {}); return nodes.get(selector); } },
    setTimeout: () => 0, clearTimeout: () => {},
  };
  runInNewContext(readFileSync("public/studio/common.js", "utf8"), context);
  runInNewContext(readFileSync("public/studio/bootstrap.js", "utf8"), context);
  assert.equal(messages[0].value.type, "interview-studio:ready");
  const key = "simple-ai-behavior-progress-v1";
  const data = { behavior: { introLocked: "Synthetic", questions: [{}], stories: [{}] }, foundations: { questions: [{}], modules: [{}] } };
  const event = { origin, source: parent, data: { type: "interview-studio:load", data, progress: { [key]: { notes: { one: "restored" } } } } };
  listener({ ...event, origin: "https://another.example" });
  listener({ ...event, source: {} });
  assert.equal(mounts, 0);
  listener(event);
  assert.equal(mounts, 1);
  assert.equal((window.KIT.read(key, {}) as { notes: { one: string } }).notes.one, "restored");
  window.KIT.write(key, { notes: { one: "changed" } });
  assert.equal(messages.at(-1)?.value.type, "interview-studio:progress");
  assert.equal(messages.at(-1)?.value.key, key);
  assert.equal(messages.every((message) => message.targetOrigin === origin), true);
  assert.equal(storageReads, 0);
  assert.equal(storageWrites, 0);
  const count = messages.length;
  window.KIT.disablePersistence();
  window.KIT.write(key, {});
  assert.equal(messages.length, count);
});
