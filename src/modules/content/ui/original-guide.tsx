import type { BilingualQuestionContent } from "../model";

export function GuideText({ text }: { text: string }) {
  return <>{text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, index) => part.startsWith("`") && part.endsWith("`")
    ? <code key={index} className="break-words rounded bg-surface px-1 py-0.5 font-mono text-[0.88em] text-ink">{part.slice(1, -1)}</code>
    : part.startsWith("**") && part.endsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : part)}</>;
}

export function OriginalGuide({ content, mode = "paired" }: { content: BilingualQuestionContent; mode?: "paired" | "english" }) {
  const guide = content.originalGuide;
  if (!guide) return null;
  const paired = mode === "paired";
  return (
    <section aria-labelledby={paired ? "original-guide-heading" : "english-answer-heading"} className="rounded-2xl border border-line bg-white p-6 sm:p-8">
      <h2 id={paired ? "original-guide-heading" : "english-answer-heading"} className="text-xl font-semibold text-ink">{paired ? "原题库 · 中英逐段对照" : "English Interview Answer"}</h2>
      <p lang={paired ? "zh-Hans" : "en"} className="mt-3 text-base font-medium leading-8 text-body"><GuideText text={paired ? content.prompt.zhHans : content.prompt.en} /></p>
      <p className="mt-3 text-xs leading-6 text-muted">Java 17/21 · Spring Framework 6+ · Spring Boot 3+ · 原题 {guide.questionNumber}</p>
      {content.practice?.length ? <aside aria-labelledby={paired ? "practice-heading" : "english-corrections-heading"} className="mt-6 rounded-xl border border-amber-200 bg-amber-50/60 p-5"><h3 id={paired ? "practice-heading" : "english-corrections-heading"} className="font-semibold text-ink">原文校对 · 请先阅读</h3>{content.practice.map((item) => <div key={item.question} className="mt-4"><h4 className="text-sm font-semibold text-body">{item.question}</h4><p lang="zh-Hans" className="mt-2 text-sm leading-7 text-body"><GuideText text={item.answer} /></p></div>)}</aside> : null}
      <div className="mt-7 space-y-6">
        {guide.blocks.map((block, index) => <section key={block.labelEn} className="border-t border-line pt-6">
          {paired ? <><h3 id={index === 0 ? "chinese-answer-heading" : undefined} className="text-lg font-semibold text-teaching">{block.labelZh}</h3><p lang="zh-Hans" className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-8 text-body"><GuideText text={block.zh} /></p></> : null}
          <h4 className={`${paired ? "mt-5" : ""} font-semibold text-brand`}>{block.labelEn}</h4>
          <p lang="en" className="mt-2 whitespace-pre-wrap break-words text-base leading-8 text-body"><GuideText text={block.en} /></p>
        </section>)}
      </div>
      <p className="mt-8 border-t border-line pt-4 text-xs leading-6 text-muted">原始资料：{guide.sourceFile} · 第 {guide.sourceLine} 行</p>
    </section>
  );
}
