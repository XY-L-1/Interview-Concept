import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOptionalOwner } from "@/modules/identity/server";
import { Icon } from "@/shared/ui/icons";
import { LoginForm } from "./login-form";
import "./login.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in", description: "Sign in to your private interview preparation workspace.", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getOptionalOwner()) redirect("/prepare");
  const { error } = await searchParams;
  return (
    <main id="main-content" className="login-page">
      <Link href="/" className="login-brand">Interview Concept</Link>
      <section className="login-card ui-card" aria-labelledby="login-heading">
        <span className="login-emblem"><Icon name="lock" size={27} /></span>
        <p className="login-eyebrow">Your private workspace</p>
        <h1 id="login-heading">A place for your next step.</h1>
        <p className="login-description">登录个人备考空间，继续你的故事、笔记和学习进度。仅已开通的账户可访问，使用邮件链接登录，无需密码。</p>
        {error && <p role="alert" className="login-alert">登录链接无效、已过期或账户无权访问。请重新发送登录邮件。</p>}
        <LoginForm />
        <div className="login-footer"><Icon name="book" size={17} /><Link href="/">Explore the learning library <span aria-hidden="true">→</span></Link></div>
      </section>
      <p className="login-bottom"><Icon name="lock" size={13} />Your preparation stays in your account.</p>
    </main>
  );
}
