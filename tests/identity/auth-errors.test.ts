import assert from "node:assert/strict";
import test from "node:test";
import { classifyLoginFailure, loginEmailFailure, loginFailureMessage } from "../../src/modules/identity/auth-errors";

test("email failures distinguish provider limits and setup without reporting a sent email", () => {
  const expected = {
    over_email_send_rate_limit: "发送限额",
    over_request_rate_limit: "请求过于频繁",
    email_address_not_authorized: "不允许向这个地址发送",
    signup_disabled: "尚未开通",
  };
  for (const [code, text] of Object.entries(expected)) {
    const state = loginEmailFailure({ code, message: "private diagnostic: secret-token" });
    assert.equal(state.sent, false);
    assert.ok(state.message.includes(text));
    assert.ok(!state.message.includes("secret-token"));
  }
  assert.equal(loginEmailFailure(null).sent, false);
  assert.equal(loginEmailFailure({ code: "__proto__" }).sent, false);
});

test("missing local verifier differs from expired or missing server flow", () => {
  assert.equal(classifyLoginFailure({ code: "pkce_code_verifier_not_found" }), "browser-mismatch");
  assert.equal(classifyLoginFailure({ name: "AuthPKCECodeVerifierMissingError" }), "browser-mismatch");
  assert.equal(classifyLoginFailure({ code: "bad_code_verifier" }), "browser-mismatch");
  assert.equal(classifyLoginFailure({ code: "flow_state_expired" }), "expired-link");
  assert.equal(classifyLoginFailure({ code: "otp_expired" }), "expired-link");
  assert.equal(classifyLoginFailure({ code: "flow_state_not_found" }), "link-unavailable");
  assert.equal(classifyLoginFailure(new Error("raw token value")), "invalid-link");
});

test("login messages explain recovery and never echo untrusted query values", () => {
  assert.ok(loginFailureMessage("browser-mismatch").includes("同一浏览器"));
  assert.ok(loginFailureMessage("missing-code").includes("授权码"));
  assert.ok(loginFailureMessage("expired-link").includes("已过期"));
  for (const reason of ["token=private", "__proto__", "constructor", "<script>"]) {
    assert.equal(loginFailureMessage(reason), loginFailureMessage("invalid-link"));
  }
});
