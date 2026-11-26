import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "npm:postgres@3.4.4";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false, max: 1 });

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 9) return "998" + digits;
  if (digits.length === 12 && digits.startsWith("998")) return digits;
  return null;
}
function genCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 10000;
  return n.toString().padStart(4, "0");
}
async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function tgSend(chatId: number | string, text: string) {
  const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  if (!r.ok) throw new Error(`telegram ${r.status}: ${await r.text()}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS, "content-type": "application/json" } });

  try {
    const { phone: rawPhone } = await req.json();
    const phone = normalizePhone(String(rawPhone ?? ""));
    if (!phone) return json({ ok: false, error: "bad_phone" }, 400);

    const links = await sql`select chat_id from telegram_links where phone = ${phone}`;
    if (!links.length) return json({ ok: false, error: "not_linked" });

    const recent = await sql`select 1 from otp_codes where phone = ${phone} and created_at > now() - interval '30 seconds' limit 1`;
    if (recent.length) return json({ ok: false, error: "rate_limited" });

    const code = genCode();
    // Store first; only send if the code is really saved.
    await sql`insert into otp_codes (phone, code_hash, expires_at)
              values (${phone}, ${await sha256Hex(code)}, now() + interval '5 minutes')`;
    await tgSend(links[0].chat_id, `<b>Daywork.uz</b> tasdiqlash kodi: <b>${code}</b>\n\nKod 5 daqiqa amal qiladi. Bu kodni hech kimga bermang.`);
    return json({ ok: true });
  } catch (e) {
    console.error("send-otp error", e);
    return json({ ok: false, error: "server_error" }, 500);
  }
});
