import Link from "next/link";
import { jdRoadmap } from "@/modules/content/jd-roadmap";
import { getPublishedQuestion } from "@/modules/content/public";

export const metadata = { title: "JD 核心复习", description: "Java backend interview preparation: mechanisms, scenarios, English answers, and recall checks." };

export default async function ReviewPage() {
  const areas = await Promise.all(jdRoadmap.map(async (area) => ({ ...area, questions: await Promise.all(area.lessons.map((lesson) => getPublishedQuestion(lesson.courseSlug, lesson.slug))) })));
  return <main id="main-content" tabIndex={-1} className="ui-page">
    <p className="text-sm font-semibold text-brand">JAVA BACKEND · PAYMENTS</p>
    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">按 JD，一项一项讲清楚。</h1>
    <p className="mt-4 max-w-3xl text-base leading-8 text-muted">12 个技术方向，27 节核心课。中文理解 → 场景推理 → 不看答案自测 → 英文表达。所有技术课无需登录即可学习，登录后可同步学习状态。</p>
    <section className="ui-card mt-7 bg-[#edf4f2] p-6" aria-label="复习方法">
      <h2 className="text-lg font-semibold text-ink">什么时候算复习到位？</h2>
      <p className="mt-2 leading-7 text-body">每项都能回答：它解决什么问题？如何工作？什么时候不适用？失败时会怎样？再完成该节 Recall，并用自己的话给出 45–90 秒英文回答。读过不等于掌握。</p>
      <p className="mt-3 text-sm leading-7 text-muted">初筛先把用途、经验边界和一个项目解释清楚；技术面继续做代码、SQL 与系统设计练习。以下顺序从请求与 Java 基础开始，不要求你先会全部术语。</p>
    </section>
    <div className="mt-7 grid items-start gap-5 lg:grid-cols-2">{areas.map((area, index) => <section key={area.title} className="ui-card p-5 sm:p-6">
      <div className="flex gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#edf1ff] font-semibold text-brand">{index + 1}</span><div><h2 className="text-xl font-semibold text-ink">{area.title}</h2><p className="mt-1 text-xs text-muted">JD：{area.requirement}</p></div></div>
      <p className="mt-4 text-sm leading-7 text-body"><strong>验收：</strong>{area.outcome}</p>
      <ol className="mt-4 space-y-2">{area.questions.map((lesson) => lesson ? <li key={lesson.question.id}><Link className="block rounded-xl border border-line px-4 py-3 text-sm leading-6 text-brand hover:bg-[#f3f5ff]" href={`/courses/${lesson.course.slug}/questions/${lesson.question.slug}`}>{lesson.revision.content.prompt.zhHans}<span className="mt-1 block text-xs text-muted">中文讲解 · 场景 · Recall · Speak English →</span></Link></li> : null)}</ol>
      {area.reference ? <Link href={`/courses/${area.reference}`} className="mt-4 inline-block text-sm font-semibold text-teaching">深入原有 Java / Spring 题库 →</Link> : null}
    </section>)}</div>
    <section className="ui-card mt-7 p-6"><h2 className="text-xl font-semibold text-ink">Behavioral：按问题练，不只按项目看</h2><p className="mt-3 text-sm leading-7 text-body">一个真实故事可回答不同问题，但 emphasis 要随题目改变：leadership 讲如何帮助团队作决定；challenge 讲调查与取舍；ownership 讲从交付到后续支持。学历和年限核对简历即可，无需技术复习。</p><Link href="/prepare#competencies" className="ui-button ui-button-primary mt-4">打开私人能力地图与回答</Link><p className="mt-3 text-xs leading-6 text-muted">个人故事需要账号授权。此公开页面只包含通用技术内容，不包含你的经历。</p></section>
  </main>;
}
