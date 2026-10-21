import type { Metadata } from "next";
import Link from "next/link";
import { StudioWorkspace } from "@/modules/preparation/studio-workspace";

export const metadata: Metadata = {
  title: "Private Interview Studio",
  description: "Open your existing interview stories and foundations in a browser-local workspace.",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <main id="main-content" tabIndex={-1}>
    <header className="mx-auto max-w-6xl px-6 py-9 sm:px-10">
      <Link href="/prepare" className="text-sm font-medium text-brand hover:underline">← 个人 profile 与岗位准备</Link>
      <p className="mt-6 font-mono text-sm text-brand">PRIVATE INTERVIEW STUDIO</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Simple AI · Stories 与基础练习</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-body">接入已有 HTML 练习站。公司专属回答保留原文；通用故事可结合其他岗位复用。</p>
    </header>
    <StudioWorkspace />
  </main>;
}
