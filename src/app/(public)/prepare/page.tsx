import type { Metadata } from "next";
import { PreparationWorkspacePage } from "@/modules/preparation";

export const metadata: Metadata = {
  title: "My preparation workspace",
  description: "A browser-local interview preparation workspace.",
  robots: { index: false, follow: false },
};

export default function PreparePage() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-6 py-10 sm:px-10 sm:py-14">
      <p className="font-mono text-sm text-brand">MY PREPARATION</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">我的面试工作区</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-body">保留同一份真实经历，为不同岗位练习不同的讲法。</p>
      <nav aria-label="Preparation sections" className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-brand">
        <a href="#role-context" className="outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand">面试岗位</a>
        <a href="#profile" className="outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand">个人事实</a>
        <a href="#stories" className="outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand">项目故事</a>
        <a href="#rehearsal" className="outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand">开口练习</a>
      </nav>
      <PreparationWorkspacePage />
    </main>
  );
}
