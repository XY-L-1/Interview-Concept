export type PrivateDocument<T> = { key: string; content: T; version: number; updatedAt: string };

export class DocumentConflict extends Error {
  constructor() { super("资料已在其他页面更新。"); }
}

export async function loadPrivateDocument<T>(key: "profile" | "studio" | "progress"): Promise<PrivateDocument<T>> {
  const response = await fetch(`/api/private/documents/${key}`, { cache: "no-store", credentials: "same-origin" });
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403
    ? "请先使用授权账号登录。" : response.status === 404 ? "私人资料尚未初始化。" : "未能读取私人资料，请稍后重试。");
  return response.json();
}

export async function savePrivateDocument<T>(key: "profile" | "studio" | "progress", content: T, expectedVersion: number, options: { keepalive?: boolean } = {}): Promise<PrivateDocument<T>> {
  const response = await fetch(`/api/private/documents/${key}`, {
    method: "PUT", credentials: "same-origin", keepalive: options.keepalive, headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, expectedVersion }),
  });
  if (response.status === 409) throw new DocumentConflict();
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403
    ? "登录已失效；本页的修改仍保留，请重新登录。" : "未能保存修改；本页内容仍保留。");
  return response.json();
}
