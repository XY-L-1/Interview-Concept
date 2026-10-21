export type LoginFailureReason = "missing-code" | "browser-mismatch" | "expired-link" | "link-unavailable" | "access-denied" | "unavailable" | "invalid-link";

function errorDetails(error: unknown): { code?: unknown; name?: unknown } {
  return error !== null && typeof error === "object" ? error : {};
}

export function loginEmailFailure(error: unknown): { sent: false; message: string } {
  const { code } = errorDetails(error);
  const messages: Record<string, string> = {
    over_email_send_rate_limit: "登录邮件未发送：邮件服务已达到发送限额。请等待限额恢复后再试，暂时不要重复点击；若持续出现，需要管理员检查邮件服务配置。",
    over_request_rate_limit: "登录邮件未发送：请求过于频繁。请稍等一会儿再试，避免连续点击。",
    email_address_not_authorized: "登录邮件未发送：当前邮件服务不允许向这个地址发送。需要管理员完成邮件发送服务配置后再试。",
    signup_disabled: "登录邮件未发送：该账户尚未开通，且网站未开放注册。请由管理员先开通授权账户。",
  };
  return { sent: false, message: typeof code === "string" && Object.hasOwn(messages, code) ? messages[code] : "登录邮件未发送。请稍后重试，或由管理员检查账户和邮件服务配置。" };
}

export function classifyLoginFailure(error: unknown): LoginFailureReason {
  const { code, name } = errorDetails(error);
  if (code === "pkce_code_verifier_not_found" || name === "AuthPKCECodeVerifierMissingError" || code === "bad_code_verifier") return "browser-mismatch";
  if (code === "flow_state_expired" || code === "otp_expired") return "expired-link";
  if (code === "flow_state_not_found") return "link-unavailable";
  if (code === "request_timeout") return "unavailable";
  return "invalid-link";
}

export function loginFailureMessage(reason: string): string {
  const messages: Record<LoginFailureReason, string> = {
    "missing-code": "这个地址没有可用的登录授权码。请从登录邮件打开完整链接；若链接无法继续，请回到发送邮件时的浏览器重新发起登录。",
    "browser-mismatch": "当前浏览器缺少本次登录的校验信息，或校验信息不匹配。请在发送登录邮件时使用的同一浏览器、同一浏览器资料中打开链接；不要改用邮件内置浏览器或无痕窗口，也不要清除 Cookie。若仍失败，请在要使用的浏览器中重新发起登录，并打开最新邮件。",
    "expired-link": "登录链接已过期。请在要使用的浏览器中重新发起登录，然后在同一浏览器打开最新邮件链接。若发送提示限流，请等待恢复后再试。",
    "link-unavailable": "本次登录流程已不可用，链接可能已使用或失效。请勿反复打开旧链接；在要使用的浏览器中重新发起登录，并打开最新邮件。若发送提示限流，请等待恢复后再试。",
    "access-denied": "此账户没有私人空间访问权限。请使用已开通的授权账户登录。",
    unavailable: "登录验证暂时不可用，请稍后重试。",
    "invalid-link": "登录链接无效或验证未完成。请在发送邮件时的同一浏览器打开最新登录邮件中的完整链接。",
  };
  return Object.hasOwn(messages, reason) ? messages[reason as LoginFailureReason] : messages["invalid-link"];
}
