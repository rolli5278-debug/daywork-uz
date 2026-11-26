import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "npm:postgres@3.4.4";

// Direct Postgres connection (SUPABASE_DB_URL is injected into every Edge Function).
// The previous version used supabase-js with the service-role key; its writes were
// silently rejected, so no code was ever stored and every check said "expired".
const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false, max: 1 });

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};
const MAX_ATTEMPTS = 5;

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 9) return "998" + digits;
  if (digits.length === 12 && digits.startsWith("998")) return digits;
  return null;
}
async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS, "content-type": "application/json" } });

  try {
    const { phone: rawPhone, code } = await req.json();
    const phone = normalizePhone(String(rawPhone ?? ""));
    if (!phone || !/^\d{4}$/.test(String(code ?? ""))) return json({ ok: false, error: "bad_request" }, 400);

    const rows = await sql`
      select id, code_hash, attempts, expires_at < now() as expired
      from otp_codes where phone = ${phone} and consumed = false
      order by created_at desc limit 1`;
    const row = rows[0];
    if (!row || row.expired) return json({ ok: false, error: "expired" });
    if (row.attempts >= MAX_ATTEMPTS) return json({ ok: false, error: "too_many_attempts" });

    if ((await sha256Hex(String(code))) !== row.code_hash) {
      await sql`update otp_codes set attempts = attempts + 1 where id = ${row.id}`;
      return json({ ok: false, error: "wrong_code", attemptsLeft: MAX_ATTEMPTS - (row.attempts + 1) });
    }
    await sql`update otp_codes set consumed = true where id = ${row.id}`;
    return json({ ok: true });
  } catch (e) {
    console.error("verify-otp error", e);
    return json({ ok: false, error: "server_error" }, 500);
  }
});
