// Client for the Telegram-based OTP verification backend (Supabase Edge Functions).
//
// This replaces the old fake "DEMO_SMS_CODE" check that used to live in this file's
// sibling (mardikor.ts) and always accepted "1234". Codes are now generated and
// checked server-side and delivered straight to the user's own Telegram chat — the
// bot token and the code itself never touch the browser. See supabase/functions/
// (telegram-webhook, send-otp, verify-otp) for the server side.
const FUNCTIONS_URL = "https://udupfvuoozzkcpgmagdl.supabase.co/functions/v1";

export type OtpError =
  | "not_linked" // this phone hasn't connected the Telegram bot yet
  | "rate_limited" // a code was already sent very recently
  | "bad_phone"
  | "bad_request"
  | "server_error"
  | "network_error"
  | "expired"
  | "too_many_attempts"
  | "wrong_code";

type SendResult = { ok: true } | { ok: false; error: OtpError };
type VerifyResult = { ok: true } | { ok: false; error: OtpError; attemptsLeft?: number };

async function post<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(`${FUNCTIONS_URL}/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await res.json()) as T;
  } catch {
    return { ok: false, error: "network_error" } as T;
  }
}

/** Sends a fresh 4-digit code to the phone's linked Telegram chat. Fails with "not_linked" if the phone hasn't connected the bot yet. */
export const sendOtp = (phone: string) => post<SendResult>("send-otp", { phone });

/** Verifies a 4-digit code the user typed in. */
export const verifyOtp = (phone: string, code: string) => post<VerifyResult>("verify-otp", { phone, code });
