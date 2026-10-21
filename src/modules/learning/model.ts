export const STUDIO_KEYS = [
  "simple-ai-behavior-progress-v1",
  "simple-ai-foundations-progress-v1",
  "simple-ai-studio-navigation-v1",
] as const;

export type StudioKey = (typeof STUDIO_KEYS)[number];
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type StudioProgress = Partial<Record<StudioKey, Record<string, JsonValue>>>;
export type LearningStatus = "learning" | "review" | "confident";
export type QuestionProgress = { status: LearningStatus; updatedAt: string };
export type ProgressDocument = {
  schemaVersion: 1;
  questions: Record<string, QuestionProgress>;
  studio: StudioProgress;
};

export function emptyProgress(): ProgressDocument {
  return { schemaVersion: 1, questions: {}, studio: {} };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isJson(value: unknown, depth = 0): value is JsonValue {
  if (depth > 24) return false;
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every((entry) => isJson(entry, depth + 1));
  return isRecord(value) && Object.entries(value).every(([key, entry]) =>
    !["__proto__", "constructor", "prototype"].includes(key) && isJson(entry, depth + 1),
  );
}

export function validateStudioProgress(value: unknown): value is StudioProgress {
  return isRecord(value) && Object.entries(value).every(([key, entry]) =>
    STUDIO_KEYS.includes(key as StudioKey) && isRecord(entry) && isJson(entry),
  );
}

export function validateProgressDocument(value: unknown): value is ProgressDocument {
  if (!isRecord(value) || value.schemaVersion !== 1 || !isRecord(value.questions)
    || !validateStudioProgress(value.studio)
    || Object.keys(value).some((key) => !["schemaVersion", "questions", "studio"].includes(key))) return false;
  return Object.entries(value.questions).every(([id, progress]) =>
    id.length > 0 && id.length <= 240 && !["__proto__", "constructor", "prototype"].includes(id)
    && isRecord(progress) && Object.keys(progress).every((key) => ["status", "updatedAt"].includes(key))
    && ["learning", "review", "confident"].includes(progress.status as string)
    && typeof progress.updatedAt === "string" && Number.isFinite(Date.parse(progress.updatedAt))
    && new Date(progress.updatedAt).toISOString() === progress.updatedAt,
  );
}

export function parseLearningProgress(value: unknown): ProgressDocument {
  if (!validateProgressDocument(value)) throw new Error("学习进度格式无效；原有记录未被覆盖。");
  return value;
}
