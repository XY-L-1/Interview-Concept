"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authConfig, configuredSiteOrigin } from "@/modules/identity/config";
import { isSameOrigin, ownerFromVerifiedUser } from "@/modules/identity/policy";
import { createAuthClient } from "@/modules/identity/server";

export type LoginState = { message: string; sent?: boolean };

async function actionOrigin(): Promise<string | null> {
  const values = await headers();
  const origin = configuredSiteOrigin(`http://${values.get("host") ?? ""}`);
  return isSameOrigin(values.get("origin"), origin) ? origin : null;
}

function formEmail(form: FormData) {
  return String(form.get("email") ?? "").trim().toLowerCase();
}

export async function sendLoginEmail(_previous: LoginState, form: FormData): Promise<LoginState> {
  try {
    const origin = await actionOrigin();
    if (!origin) return { message: "请求来源无效，请重新打开登录页。" };
    const email = formEmail(form);
    if (email !== authConfig().ownerEmail.trim().toLowerCase()) return { message: "此账户没有访问权限。" };
    const supabase = await createAuthClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${origin}/auth/callback` },
    });
    if (error) return { message: "登录邮件发送失败。请稍后重试，或检查账户是否已开通。" };
    return { sent: true, message: "登录邮件已发送。请在这个浏览器打开邮件中的链接；如果邮件提供验证码，也可在下方输入。" };
  } catch {
    return { message: "登录暂时不可用，请稍后重试。" };
  }
}

export async function verifyLoginCode(_previous: LoginState, form: FormData): Promise<LoginState> {
  let verified = false;
  try {
    if (!await actionOrigin()) return { message: "请求来源无效，请重新打开登录页。" };
    const email = formEmail(form);
    const token = String(form.get("token") ?? "").trim();
    const config = authConfig();
    if (email !== config.ownerEmail.trim().toLowerCase() || !/^\d{6,10}$/.test(token)) {
      return { message: "请输入已开通的邮箱和邮件中的有效验证码。" };
    }
    const supabase = await createAuthClient();
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    if (error) return { message: "验证码无效或已过期，请重新获取登录邮件。" };
    const { data: { user } } = await supabase.auth.getUser();
    verified = !!ownerFromVerifiedUser(user, config.ownerEmail);
    if (!verified) {
      await supabase.auth.signOut({ scope: "local" });
      return { message: "此账户没有访问权限。" };
    }
  } catch { return { message: "登录暂时不可用，请稍后重试。" }; }
  if (verified) redirect("/prepare");
  return { message: "登录失败，请重试。" };
}

