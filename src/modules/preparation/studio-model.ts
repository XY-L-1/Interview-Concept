export const STUDIO_STORAGE_KEY = "interview-studio:content:v1";
export const STUDIO_PROGRESS_KEYS = ["simple-ai-behavior-progress-v1", "simple-ai-foundations-progress-v1", "simple-ai-studio-navigation-v1"];

type Item = Record<string, unknown> & { id: string; title: string };
export type StudioBundle = {
  schemaVersion: 1;
  behavior: Record<string, unknown> & { introLocked: string; questions: Item[]; stories: Item[] };
  foundations: Record<string, unknown> & { questions: Item[]; modules: Item[] };
};

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function parseStudioBundle(raw: string): StudioBundle {
  if (raw.length > 2_000_000) throw new Error("资料包超过 2,000,000 字符限制。");
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new Error("JSON 格式无效。请选择完整 Studio 资料包。"); }
  if (!record(value) || value.schemaVersion !== 1 || !record(value.behavior) || !record(value.foundations)) {
    throw new Error("需要 schemaVersion 1 的 Studio 资料包，包含 behavior 和 foundations。");
  }
  const behavior = value.behavior;
  const foundations = value.foundations;
  function items(input: unknown, label: string, nonempty = true): asserts input is Item[] {
    if (!Array.isArray(input) || (nonempty && !input.length) || input.some((item) => !record(item) || typeof item.id !== "string" || !item.id.trim() || typeof item.title !== "string" || !item.title.trim())) {
      throw new Error(`${label} 格式无效。`);
    }
    if (new Set(input.map((item) => item.id)).size !== input.length) throw new Error(`${label} 包含重复 ID。`);
  }
  items(behavior.questions, "行为题");
  items(behavior.stories, "故事");
  items(behavior.sources, "行为题来源", false);
  items(foundations.questions, "基础题");
  items(foundations.modules, "基础模块");
  items(foundations.sources, "基础题来源", false);
  function strings(input: unknown, label: string, optional = true) {
    if (optional && input === undefined) return;
    if (!Array.isArray(input) || !input.every((entry) => typeof entry === "string")) throw new Error(`${label} 必须是文本数组。`);
  }
  function followUps(input: unknown) {
    if (input !== undefined && (!Array.isArray(input) || !input.every((entry) => typeof entry === "string" || (record(entry) && typeof entry.q === "string" && (entry.guide === undefined || typeof entry.guide === "string"))))) throw new Error("行为追问格式无效。");
  }
  if (behavior.factNotes !== undefined && (!Array.isArray(behavior.factNotes) || !behavior.factNotes.every((note) => Array.isArray(note) && note.length === 2 && note.every((entry) => typeof entry === "string")))) throw new Error("事实边界需要标题与说明的文本对。");
  if (typeof behavior.introLocked !== "string") throw new Error("缺少 introduction 定稿。");
  const storyIds = new Set(behavior.stories.map((story) => story.id));
  for (const story of behavior.stories) {
    if (!["ready", "needs-details"].includes(story.readiness as string)) throw new Error("故事需要保留 ready 或 needs-details 状态。");
    if (!record(story.star) || ["s", "t", "a", "r"].some((key) => typeof (story.star as Record<string, unknown>)[key] !== "string") || typeof story.spoken !== "string" || !Array.isArray(story.tags)) {
      throw new Error("故事需要完整 STAR、英文口述和标签。");
    }
    for (const key of ["tags", "missingFacts", "guardrails", "sourceIds"]) strings(story[key], `故事 ${key}`);
    followUps(story.followUps);
  }
  for (const question of behavior.questions) {
    if (!["ready", "needs-details"].includes(question.status as string)) throw new Error("行为题需要保留 ready 或 needs-details 状态。");
    if (typeof question.answer !== "string" || !["outline", "storyIds"].every((key) => Array.isArray(question[key]))) throw new Error("行为题缺少回答或结构。");
    for (const key of ["outline", "storyIds", "missingFacts", "sourceIds"]) strings(question[key], `行为题 ${key}`);
    if (!(question.storyIds as string[]).every((id) => storyIds.has(id))) throw new Error("行为题关联了不存在的故事。");
    followUps(question.followUps);
  }
  if (behavior.competencies !== undefined) {
    items(behavior.competencies, "能力维度", false);
    const questionIds = new Set(behavior.questions.map((question) => question.id));
    for (const competency of behavior.competencies) {
      strings(competency.questionIds, "能力维度 questionIds", false);
      strings(competency.storyIds, "能力维度 storyIds", false);
      if (typeof competency.description !== "string" || typeof competency.practiceGoal !== "string") throw new Error("能力维度缺少说明或练习目标。");
      if (!(competency.questionIds as string[]).every((id) => questionIds.has(id)) || !(competency.storyIds as string[]).every((id) => storyIds.has(id))) throw new Error("能力维度关联了不存在的问题或故事。");
    }
  }
  const moduleIds = new Set(foundations.modules.map((module) => module.id));
  if (foundations.modules.some((module) => typeof module.order !== "number" || !Number.isFinite(module.order))) throw new Error("基础模块需要有效排序。");
  for (const question of foundations.questions) {
    if (!moduleIds.has(question.module as string) || typeof question.lesson !== "string" || typeof question.englishAnswer !== "string" || !Array.isArray(question.options) || question.options.length !== 4 || !question.options.every((option) => typeof option === "string") || !Number.isInteger(question.correctIndex) || Number(question.correctIndex) < 0 || Number(question.correctIndex) >= question.options.length) {
      throw new Error("基础题需要有效模块、讲解、英文回答和测验答案。");
    }
    for (const key of ["keyPoints", "followUps", "sourceIds", "wrongExplanations"]) strings(question[key], `基础题 ${key}`);
    if (question.followUpAnswers !== undefined && (!Array.isArray(question.followUpAnswers) || !question.followUpAnswers.every((entry) => record(entry) && typeof entry.q === "string" && typeof entry.answer === "string"))) throw new Error("基础题追问需要问题与回答。");
  }
  return value as StudioBundle;
}
