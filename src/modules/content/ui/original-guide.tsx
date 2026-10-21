import type { BilingualQuestionContent } from "../model";

function GuideText({ text }: { text: string }) {
  return <>{text.split(/(`[^`]+`)/g).map((part, index) => part.startsWith("`") && part.endsWith("`")
    ? <code key={index} className="break-words rounded bg-surface px-1 font-mono text-[0.9em]">{part.slice(1, -1)}</code>
    : part)}</>;
}

export function OriginalGuide({ content }: { content: BilingualQuestionContent }) {
  const guide = content.originalGuide;
  if (!guide) return null;
  return (
    <section aria-labelledby="original-guide-heading" className="mt-8 max-w-4xl">
      <h2 id="original-guide-heading" className="text-xl font-semibold text-teaching">原题库 · 中英逐段对照</h2>
      <p lang="zh-Hans" className="mt-3 text-lg leading-8 text-ink"><GuideText text={content.prompt.zhHans} /></p>
      <p className="mt-3 text-sm leading-6 text-muted">Java 17/21 · Spring Framework 6+ · Spring Boot 3+。保留原题号 {guide.questionNumber} 和四组中英内容。</p>
      {content.practice?.length ? <aside aria-labelledby="practice-heading" className="mt-6 rounded border border-line bg-surface p-5"><h3 id="practice-heading" className="font-semibold text-ink">原文校对 · 请先阅读</h3>{content.practice.map((item) => <div key={item.question} className="mt-4"><h4 className="font-semibold text-body">{item.question}</h4><p lang="zh-Hans" className="mt-2 text-sm leading-7 text-body"><GuideText text={item.answer} /></p></div>)}</aside> : null}
      <div className="mt-7 space-y-8">
        {guide.blocks.map((block, index) => (
          <section key={block.labelEn} className="border-t border-line pt-6">
            <h3 id={index === 0 ? "chinese-answer-heading" : undefined} className="text-lg font-semibold text-teaching">{block.labelZh}</h3>
            <p lang="zh-Hans" className="mt-3 whitespace-pre-wrap break-words text-base leading-8 text-body"><GuideText text={block.zh} /></p>
            <h4 id={index === 0 ? "english-answer-heading" : undefined} className="mt-5 font-semibold text-brand">{block.labelEn}</h4>
            <p lang="en" className="mt-2 whitespace-pre-wrap break-words text-base leading-8 text-body"><GuideText text={block.en} /></p>
          </section>
        ))}
      </div>
      <p className="mt-8 border-t border-line pt-4 text-xs leading-6 text-muted">原始资料：{guide.sourceFile} · 第 {guide.sourceLine} 行</p>
    </section>
  );
}
