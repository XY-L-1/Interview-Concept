export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = "interview-preparation:v1";

export type Focus = "payments-java" | "backend-platform" | "applied-ai";
export type Provenance = "user-confirmed" | "code-evidence" | "needs-review";
export type Contribution = "personal" | "team" | "context";

export type Fact = {
  id: string;
  text: string;
  tags: string[];
  provenance: Provenance;
  contribution: Contribution;
  source: string;
};

export type Story = {
  id: string;
  title: string;
  factIds: string[];
  reflection: string;
};

export type Profile = {
  displayName: string;
  facts: Fact[];
  stories: Story[];
};

export type RoleContext = {
  company: string;
  roleTitle: string;
  focus: Focus;
  interviewDate: string;
  notes: string;
};

export type PreparationWorkspace = {
  schemaVersion: 1;
  profile: Profile;
  context: RoleContext;
};

export type ValidationResult =
  | { ok: true; value: PreparationWorkspace }
  | { ok: false; errors: string[] };

export function createEmptyWorkspace(): PreparationWorkspace {
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: { displayName: "", facts: [], stories: [] },
    context: {
      company: "",
      roleTitle: "",
      focus: "payments-java",
      interviewDate: "",
      notes: "",
    },
  };
}

export function validateWorkspace(input: unknown): ValidationResult {
  const errors: string[] = [];

  function object(
    value: unknown,
    path: string,
    keys: readonly string[],
  ): Record<string, unknown> | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      errors.push(`${path} 必须是对象。`);
      return null;
    }
    const record = value as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      if (!keys.includes(key)) errors.push(`${path}.${key} 是不支持的字段。`);
    }
    return record;
  }

  function text(value: unknown, path: string, required = false) {
    if (typeof value !== "string" || (required && !value.trim())) {
      errors.push(`${path} 必须是${required ? "非空" : ""}字符串。`);
    }
  }

  function stringList(value: unknown, path: string): value is string[] {
    if (!Array.isArray(value)) {
      errors.push(`${path} 必须是字符串数组。`);
      return false;
    }
    value.forEach((entry, index) => text(entry, `${path}[${index}]`, true));
    if (new Set(value).size !== value.length) errors.push(`${path} 不能包含重复值。`);
    return value.every((entry) => typeof entry === "string" && entry.trim());
  }

  function choice(value: unknown, path: string, choices: readonly string[]) {
    if (typeof value !== "string" || !choices.includes(value)) {
      errors.push(`${path} 必须为 ${choices.join(" / ")}。`);
    }
  }

  const root = object(input, "workspace", ["schemaVersion", "profile", "context"]);
  if (!root) return { ok: false, errors };
  if (root.schemaVersion !== SCHEMA_VERSION) {
    errors.push("schemaVersion 必须为 1；其他版本不会被覆盖或自动转换。");
  }
  const profile = object(root.profile, "profile", ["displayName", "facts", "stories"]);
  const factIds = new Set<string>();
  if (profile) {
    text(profile.displayName, "profile.displayName");
    if (!Array.isArray(profile.facts)) {
      errors.push("profile.facts 必须是数组。");
    } else {
      profile.facts.forEach((entry, index) => {
        const path = `profile.facts[${index}]`;
        const fact = object(entry, path, ["id", "text", "tags", "provenance", "contribution", "source"]);
        if (!fact) return;
        text(fact.id, `${path}.id`, true);
        text(fact.text, `${path}.text`, true);
        text(fact.source, `${path}.source`);
        stringList(fact.tags, `${path}.tags`);
        choice(fact.provenance, `${path}.provenance`, ["user-confirmed", "code-evidence", "needs-review"]);
        choice(fact.contribution, `${path}.contribution`, ["personal", "team", "context"]);
        if (typeof fact.id === "string") {
          if (factIds.has(fact.id)) errors.push(`${path}.id 重复：${fact.id}。`);
          factIds.add(fact.id);
        }
      });
    }
    if (!Array.isArray(profile.stories)) {
      errors.push("profile.stories 必须是数组。");
    } else {
      const storyIds = new Set<string>();
      profile.stories.forEach((entry, index) => {
        const path = `profile.stories[${index}]`;
        const story = object(entry, path, ["id", "title", "factIds", "reflection"]);
        if (!story) return;
        text(story.id, `${path}.id`, true);
        text(story.title, `${path}.title`, true);
        text(story.reflection, `${path}.reflection`);
        if (typeof story.id === "string") {
          if (storyIds.has(story.id)) errors.push(`${path}.id 重复：${story.id}。`);
          storyIds.add(story.id);
        }
        if (stringList(story.factIds, `${path}.factIds`)) {
          for (const id of story.factIds) {
            if (!factIds.has(id)) errors.push(`${path}.factIds 引用了不存在的事实：${id}。`);
          }
        }
      });
    }
  }
  const context = object(root.context, "context", ["company", "roleTitle", "focus", "interviewDate", "notes"]);
  if (context) {
    for (const field of ["company", "roleTitle", "interviewDate", "notes"]) {
      text(context[field], `context.${field}`);
    }
    choice(context.focus, "context.focus", ["payments-java", "backend-platform", "applied-ai"]);
    if (
      typeof context.interviewDate === "string" &&
      context.interviewDate !== "" &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(context.interviewDate) ||
        !Number.isFinite(Date.parse(context.interviewDate)) ||
        new Date(context.interviewDate).toISOString().slice(0, 10) !== context.interviewDate)
    ) {
      errors.push("context.interviewDate 必须为空或有效的 YYYY-MM-DD 日期。");
    }
  }
  return errors.length
    ? { ok: false, errors }
    : { ok: true, value: input as PreparationWorkspace };
}

export function parseWorkspace(json: string): ValidationResult {
  if (json.length > 1_000_000) return { ok: false, errors: ["JSON 超过 1,000,000 字符限制。"] };
  let input: unknown;
  try {
    input = JSON.parse(json);
  } catch {
    return { ok: false, errors: ["JSON 格式无效。请检查引号、逗号和括号。"] };
  }
  return validateWorkspace(input);
}

export function serializeWorkspace(workspace: PreparationWorkspace): string {
  const result = validateWorkspace(workspace);
  if (!result.ok) throw new Error(result.errors.join("\n"));
  return `${JSON.stringify(workspace, null, 2)}\n`;
}
