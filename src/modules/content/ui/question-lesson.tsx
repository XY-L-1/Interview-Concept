import Link from "next/link";
import { BacklogExplorer } from "./backlog-explorer";
import type {
  CodeExample,
  PublishedQuestionLesson,
  QuestionNavigationItem,
  TeachingExample,
} from "../model";

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      className="size-7 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? (
        <>
          <path d="M19 12H5" />
          <path d="m11 18-6-6 6-6" />
        </>
      ) : (
        <>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </>
      )}
    </svg>
  );
}

function CodeBlock({ example }: { example: CodeExample }) {
  return (
    <figure className="mt-5 min-w-0">
      <figcaption className="sr-only">
        {example.language} code example
      </figcaption>
      <pre className="max-w-full overflow-x-auto border border-line bg-code px-5 py-4 font-mono text-[0.875rem] leading-6 text-code-ink">
        <code>{example.code}</code>
      </pre>
    </figure>
  );
}

function TeachingExampleBlock({ example }: { example: TeachingExample }) {
  if (example.kind === "code") {
    return (
      <div>
        <CodeBlock example={example} />
        <p className="mt-3 text-[0.98rem] leading-7 text-body">
          {example.explanationZhHans}
        </p>
      </div>
    );
  }

  if (example.kind === "diagram") {
    return (
      <figure className="mt-5 border border-line bg-surface p-5">
        <figcaption className="font-semibold text-ink">
          {example.title}
        </figcaption>
        <p className="mt-2 text-[0.98rem] leading-7 text-body">
          {example.descriptionZhHans}
        </p>
      </figure>
    );
  }

  return (
    <div className="mt-5 border border-line bg-surface p-5">
      <p className="font-semibold text-ink">{example.title}</p>
      <p className="mt-2 text-[0.98rem] leading-7 text-body">
        {example.explanationZhHans}
      </p>
    </div>
  );
}

function NavigationLink({
  courseSlug,
  direction,
  item,
}: {
  courseSlug: string;
  direction: "previous" | "next";
  item: QuestionNavigationItem;
}) {
  const isPrevious = direction === "previous";

  return (
    <Link
      href={`/courses/${courseSlug}/questions/${item.slug}`}
      className={`group flex max-w-md items-center gap-4 outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 ${
        isPrevious ? "" : "ml-auto text-right"
      }`}
    >
      {isPrevious ? <ArrowIcon direction="left" /> : null}
      <span>
        <span className="block text-sm font-semibold text-ink">
          {isPrevious ? "Previous" : "Next"}
        </span>
        <span className="mt-1 block text-sm leading-5 text-muted transition-colors group-hover:text-brand group-focus-visible:text-brand">
          {item.prompt}
        </span>
      </span>
      {isPrevious ? null : <ArrowIcon direction="right" />}
    </Link>
  );
}

function CurriculumRail({ lesson }: { lesson: PublishedQuestionLesson }) {
  const questionNumbers = new Map(
    lesson.sections
      .flatMap((section) => section.questions)
      .map((question, index) => [question.id, index + 1]),
  );

  return (
    <aside className="hidden border-r border-line px-6 py-10 lg:flex lg:min-h-[calc(100svh-4rem)] lg:flex-col">
      <Link
        href={`/courses/${lesson.course.slug}`}
        className="text-2xl font-semibold tracking-tight text-ink outline-none transition-colors hover:text-brand focus-visible:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4"
      >
        {lesson.course.title.en}
      </Link>

      <nav aria-label={`${lesson.course.title.en} curriculum`} className="mt-9">
        {lesson.sections.map((section) => (
          <div key={section.id} className="mb-8">
            <p className="flex gap-3 text-sm font-semibold text-ink">
              <span className="font-mono font-normal text-muted">
                {String(section.order).padStart(2, "0")}
              </span>
              {section.title.en}
            </p>

            <ol className="mt-4 space-y-1">
              {section.questions.map((question) => {
                const questionNumber = questionNumbers.get(question.id);
                const isCurrent = question.id === lesson.question.id;

                return (
                  <li key={question.id}>
                    <Link
                      href={`/courses/${lesson.course.slug}/questions/${question.slug}`}
                      aria-current={isCurrent ? "page" : undefined}
                      className={`grid grid-cols-[2rem_minmax(0,1fr)] gap-2 border-l-[3px] py-3 pl-3 pr-2 text-sm leading-5 outline-none transition-colors ${
                        isCurrent
                          ? "border-brand bg-teaching-soft font-semibold text-ink focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                          : "border-transparent text-muted hover:border-line hover:text-ink focus-visible:border-brand focus-visible:text-ink focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                      }`}
                    >
                      <span className="font-mono text-brand">
                        {String(questionNumber).padStart(2, "0")}
                      </span>
                      <span>{question.prompt.en}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </nav>

      <p className="mt-auto border-t border-line pt-5 font-mono text-sm text-muted">
        {lesson.questionNumber} of {lesson.questionCount}
      </p>
    </aside>
  );
}

function ChineseTextList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-3 space-y-2 pl-5 text-[0.98rem] leading-7 text-body marker:text-teaching">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function QuestionLesson({
  lesson,
}: {
  lesson: PublishedQuestionLesson;
}) {
  const { content } = lesson.revision;
  const chinese = content.chineseDeepDive;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto grid w-full max-w-[1500px] lg:grid-cols-[20rem_minmax(0,1fr)]"
    >
      <CurriculumRail lesson={lesson} />

      <article className="min-w-0 px-6 pb-16 pt-8 sm:px-10 sm:pb-20 lg:px-16 xl:px-28">
        <Link
          href={`/courses/${lesson.course.slug}`}
          className="mb-8 inline-flex text-sm font-medium text-muted outline-none transition-colors hover:text-brand focus-visible:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 lg:hidden"
        >
          ← {lesson.course.title.en} course outline
        </Link>

        <header className="max-w-5xl">
          <p className="font-mono text-sm text-muted">
            Question {String(lesson.questionNumber).padStart(2, "0")} ·{" "}
            <span className="capitalize">{lesson.question.difficulty}</span>
          </p>
          <h1 className="mt-4 max-w-5xl text-4xl font-semibold leading-[1.06] tracking-[-0.04em] text-ink sm:text-5xl lg:text-[3.25rem]">
            {content.prompt.en}
          </h1>
          <nav aria-label="Lesson sections" className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-brand">
            <a href="#chinese-answer-heading" className="hover:underline focus-visible:outline-2 focus-visible:outline-brand">中文深讲</a>
            <a href="#english-answer-heading" className="hover:underline focus-visible:outline-2 focus-visible:outline-brand">English answer</a>
            {content.practice?.length ? <a href="#practice-heading" className="hover:underline focus-visible:outline-2 focus-visible:outline-brand">练习与自测</a> : null}
          </nav>
        </header>

        <section
          lang="en"
          aria-labelledby="english-answer-heading"
          className="mt-6 max-w-4xl border-l-[3px] border-brand pl-5 sm:pl-6"
        >
          <h2
            id="english-answer-heading"
            className="text-xl font-semibold text-brand sm:text-2xl"
          >
            English Interview Answer
          </h2>
          <p className="mt-3 text-[1.0625rem] leading-7 text-body">
            {content.englishInterviewAnswer.answer}
          </p>
          {content.englishInterviewAnswer.codeExample ? (
            <CodeBlock example={content.englishInterviewAnswer.codeExample} />
          ) : null}
        </section>

        <section
          lang="zh-Hans"
          aria-labelledby="chinese-answer-heading"
          className="mt-7 max-w-5xl border-l-[3px] border-teaching pl-5 sm:pl-6"
        >
          <h2
            id="chinese-answer-heading"
            className="text-xl font-semibold text-teaching sm:text-2xl"
          >
            中文深度讲解
          </h2>

          <div className="mt-7 grid grid-cols-[minmax(0,1fr)] gap-x-14 gap-y-8 xl:grid-cols-2">
            <div className="min-w-0">
              <section aria-labelledby="definition-heading">
                <h3
                  id="definition-heading"
                  className="text-lg font-semibold text-ink"
                >
                  定义
                </h3>
                {chinese.definition.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-3 text-[0.98rem] leading-7 text-body"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>

              <section
                aria-labelledby="mechanism-heading"
                className="mt-7 border-t border-line pt-7"
              >
                <h3
                  id="mechanism-heading"
                  className="text-lg font-semibold text-ink"
                >
                  核心机制
                </h3>
                {chinese.coreMechanism.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-3 text-[0.98rem] leading-7 text-body"
                  >
                    {paragraph}
                  </p>
                ))}
              </section>

              <section
                aria-labelledby="example-heading"
                className="mt-7 border-t border-line pt-7"
              >
                <h3
                  id="example-heading"
                  className="text-lg font-semibold text-ink"
                >
                  示例
                </h3>
                {chinese.examples.map((example, index) => (
                  <TeachingExampleBlock
                    key={`${example.kind}-${index}`}
                    example={example}
                  />
                ))}
              </section>

              <section
                aria-labelledby="use-cases-heading"
                className="mt-7 border-t border-line pt-7"
              >
                <h3
                  id="use-cases-heading"
                  className="text-lg font-semibold text-ink"
                >
                  使用场景
                </h3>
                <ChineseTextList items={chinese.useCases} />
              </section>
            </div>

            <div className="min-w-0">
              <section aria-labelledby="mistakes-heading">
                <h3
                  id="mistakes-heading"
                  className="text-lg font-semibold text-ink"
                >
                  常见错误
                </h3>
                <ChineseTextList items={chinese.commonMistakes} />
              </section>

              <section
                aria-labelledby="follow-ups-heading"
                className="mt-7 border-t border-line pt-7"
              >
                <h3
                  id="follow-ups-heading"
                  className="text-lg font-semibold text-ink"
                >
                  面试追问
                </h3>
                <dl className="mt-3 space-y-5">
                  {chinese.followUpQuestions.map((followUp) => (
                    <div key={followUp.question}>
                      <dt className="font-semibold leading-7 text-ink">
                        {followUp.question}
                      </dt>
                      <dd className="mt-1 text-[0.98rem] leading-7 text-body">
                        {followUp.answer}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section
                aria-labelledby="summary-heading"
                className="mt-7 border-t border-line pt-7"
              >
                <h3
                  id="summary-heading"
                  className="text-lg font-semibold text-ink"
                >
                  面试总结
                </h3>
                <p className="mt-3 text-[0.98rem] leading-7 text-body">
                  {chinese.interviewSummary}
                </p>
              </section>
            </div>
          </div>
        </section>

        {lesson.course.slug === "backend-systems" &&
        ["concurrency-throughput-latency", "backlog-and-bottlenecks"].includes(lesson.question.slug) ? <BacklogExplorer /> : null}

        {content.practice?.length ? (
          <section
            lang="zh-Hans"
            aria-labelledby="practice-heading"
            className="mt-9 max-w-5xl border-t border-line pt-7"
          >
            <h2 id="practice-heading" className="text-xl font-semibold text-ink">
              练习 · 先回答，再展开
            </h2>
            <div className="mt-4 divide-y divide-line border-y border-line">
              {content.practice.map((item) => (
                <details key={item.question} className="py-4">
                  <summary className="cursor-pointer font-medium leading-7 text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-[0.98rem] leading-7 text-body">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {content.sources?.length ? (
          <section
            lang="zh-Hans"
            aria-labelledby="sources-heading"
            className="mt-9 max-w-5xl border-t border-line pt-7"
          >
            <h2 id="sources-heading" className="text-xl font-semibold text-ink">
              官方资料 · 继续阅读
            </h2>
            <ul className="mt-3 space-y-2 pl-5 text-sm leading-6 marker:text-brand">
              {content.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    className="text-brand underline underline-offset-4 outline-none hover:text-brand-strong focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4"
                  >
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <nav
          aria-label="Question navigation"
          className="mt-12 grid grid-cols-2 gap-6 border-t border-line pt-7"
        >
          <div>
            {lesson.previous ? (
              <NavigationLink
                courseSlug={lesson.course.slug}
                direction="previous"
                item={lesson.previous}
              />
            ) : null}
          </div>
          <div>
            {lesson.next ? (
              <NavigationLink
                courseSlug={lesson.course.slug}
                direction="next"
                item={lesson.next}
              />
            ) : null}
          </div>
        </nav>
      </article>
    </main>
  );
}
