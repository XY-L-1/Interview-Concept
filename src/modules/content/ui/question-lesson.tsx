import type { CodeExample, PublishedQuestionLesson, TeachingExample } from "../model";
import { LessonExperience } from "./lesson-experience";
import { GuideText, OriginalGuide } from "./original-guide";

function CodeBlock({ example }: { example: CodeExample }) {
  return <figure className="mt-4 min-w-0"><figcaption className="sr-only">{example.language} code example</figcaption><pre className="max-w-full overflow-x-auto rounded-xl border border-line bg-code p-5 font-mono text-sm leading-6 text-code-ink"><code>{example.code}</code></pre><p className="mt-3 text-sm leading-7 text-muted"><GuideText text={example.explanationZhHans} /></p></figure>;
}

function Example({ example }: { example: TeachingExample }) {
  if (example.kind === "code") return <CodeBlock example={example} />;
  return <figure className="mt-4 rounded-xl border border-line bg-surface p-5"><figcaption className="font-semibold text-ink">{example.title}</figcaption><p className="mt-2 whitespace-pre-wrap text-[15px] leading-8 text-body"><GuideText text={example.kind === "diagram" ? example.descriptionZhHans : example.explanationZhHans} /></p></figure>;
}

function TextList({ items }: { items: readonly string[] }) {
  return <ul className="mt-3 space-y-3 pl-5 text-[15px] leading-8 text-body marker:text-teaching">{items.map((item) => <li key={item}><GuideText text={item} /></li>)}</ul>;
}

export function QuestionLesson({ lesson }: { lesson: PublishedQuestionLesson }) {
  const { content } = lesson.revision;
  const chinese = content.chineseDeepDive;
  const examples = <div key="lesson-examples" className="space-y-5">{chinese.examples.map((example, index) => <Example key={index} example={example} />)}</div>;

  const understand = content.originalGuide ? <OriginalGuide key="paired-guide" content={content} /> : (
    <section key="chinese-lesson" lang="zh-Hans" aria-labelledby="chinese-answer-heading" className="rounded-2xl border border-line bg-white p-6 sm:p-8">
      <h2 id="chinese-answer-heading" className="text-xl font-semibold text-ink">把这个概念真正讲清楚</h2>
      <p className="mt-2 text-base leading-8 text-teaching"><GuideText text={content.prompt.zhHans} /></p>
      <section aria-labelledby="definition-heading" className="mt-7"><h3 id="definition-heading" className="text-lg font-semibold text-ink">先理解定义</h3>{chinese.definition.map((paragraph) => <p key={paragraph} className="mt-3 text-[15px] leading-8 text-body"><GuideText text={paragraph} /></p>)}</section>
      <section aria-labelledby="mechanism-heading" className="mt-7 border-t border-line pt-6"><h3 id="mechanism-heading" className="text-lg font-semibold text-ink">一步一步看机制</h3>{chinese.coreMechanism.map((paragraph, index) => <div key={paragraph} className="mt-4 flex items-start gap-3"><span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-teaching-soft text-xs font-semibold text-teaching">{index + 1}</span><p className="text-[15px] leading-8 text-body"><GuideText text={paragraph} /></p></div>)}</section>
      <section aria-labelledby="example-heading" className="mt-7 border-t border-line pt-6"><h3 id="example-heading" className="text-lg font-semibold text-ink">跟着例子走一遍</h3>{examples}</section>
      <section aria-labelledby="use-cases-heading" className="mt-7 border-t border-line pt-6"><h3 id="use-cases-heading" className="text-lg font-semibold text-ink">什么时候用</h3><TextList items={chinese.useCases} /></section>
      <section aria-labelledby="mistakes-heading" className="mt-7 border-t border-line pt-6"><h3 id="mistakes-heading" className="text-lg font-semibold text-ink">边界与容易误解的地方</h3><TextList items={chinese.commonMistakes} /></section>
      <section aria-labelledby="follow-ups-heading" className="mt-7 border-t border-line pt-6"><h3 id="follow-ups-heading" className="text-lg font-semibold text-ink">再往深处问</h3><dl className="mt-4 space-y-5">{chinese.followUpQuestions.map((item) => <div key={item.question}><dt className="font-semibold leading-7 text-ink"><GuideText text={item.question} /></dt><dd className="mt-2 text-[15px] leading-8 text-body"><GuideText text={item.answer} /></dd></div>)}</dl></section>
      <section aria-labelledby="summary-heading" className="mt-7 rounded-xl bg-teaching-soft p-5"><h3 id="summary-heading" className="font-semibold text-teaching">用自己的话收束</h3><p className="mt-2 text-[15px] leading-8 text-body"><GuideText text={chinese.interviewSummary} /></p></section>
    </section>
  );

  const english = content.originalGuide ? <OriginalGuide key="english-guide" content={content} mode="english" /> : (
    <section key="english-lesson" lang="en" aria-labelledby="english-answer-heading" className="rounded-2xl border border-line bg-white p-6 sm:p-8">
      <h2 id="english-answer-heading" className="text-xl font-semibold text-ink">English Interview Answer</h2>
      <p className="mt-3 text-base font-medium leading-7 text-muted"><GuideText text={content.prompt.en} /></p>
      <p className="mt-6 whitespace-pre-wrap text-[17px] leading-8 text-body"><GuideText text={content.englishInterviewAnswer.answer} /></p>
      <h3 className="mt-7 border-t border-line pt-6 font-semibold text-ink">Points to carry into your own answer</h3>
      <TextList items={content.englishInterviewAnswer.keyPoints} />
      {content.englishInterviewAnswer.codeExample ? <CodeBlock example={content.englishInterviewAnswer.codeExample} /> : null}
    </section>
  );

  return <LessonExperience key={lesson.question.id} lesson={lesson} understand={understand} english={english} examples={examples} />;
}
