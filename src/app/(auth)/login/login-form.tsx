"use client";

import { useActionState, useState } from "react";
import { sendLoginEmail, verifyLoginCode } from "./actions";

const initialState = { message: "" };

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sendState, sendAction, sending] = useActionState(sendLoginEmail, initialState);
  const [verifyState, verifyAction, verifying] = useActionState(verifyLoginCode, initialState);
  return (
    <div className="login-forms">
      <form action={sendAction} className="login-email-form">
        <label htmlFor="login-email">邮箱 · Email</label>
        <input id="login-email" name="email" type="email" autoComplete="email" required
          value={email} onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com" className="ui-input" />
        <button disabled={sending || verifying} className="ui-button ui-button-primary login-submit">
          {sending ? "正在发送…" : "发送登录邮件"}<span aria-hidden="true">→</span>
        </button>
        <p role="status" className="login-message">{sendState.message}</p>
      </form>
      <details className="login-code"><summary>邮件中有验证码？</summary><form action={verifyAction} className="login-code-form">
        <input type="hidden" name="email" value={email} />
        <label htmlFor="login-token">验证码（仅当邮件提供时）</label>
        <input id="login-token" name="token" type="text" inputMode="numeric" autoComplete="one-time-code"
          minLength={6} maxLength={10} pattern="[0-9]{6,10}" required
          className="ui-input login-token" />
        <button disabled={sending || verifying || !email} className="ui-button ui-button-secondary login-submit">
          {verifying ? "正在验证…" : "验证并登录"}
        </button>
        <p role="status" className="login-message">{verifyState.message}</p>
      </form></details>
    </div>
  );
}
