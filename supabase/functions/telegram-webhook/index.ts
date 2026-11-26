import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "npm:postgres@3.4.4";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const WEBHOOK_SECRET = Deno.env.get("TELEGRAM_WEBHOOK_SECRET")!;
// Direct Postgres connection (SUPABASE_DB_URL is injected into every Edge Function).
// supabase-js + service-role writes were silently rejected before, so codes were never saved.
const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false, max: 1 });

// Hardcoded on purpose: req.url inside the edge runtime is an internal address.
const PUBLIC_URL = "https://udupfvuoozzkcpgmagdl.supabase.co/functions/v1/telegram-webhook";

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
async function tgSend(chatId: number, text: string, replyMarkup?: unknown) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, reply_markup: replyMarkup, parse_mode: "HTML" }),
  });
}
const pretty = (p: string) => `+${p.slice(0, 3)} ${p.slice(3, 5)} ${p.slice(5, 8)} ${p.slice(8, 10)} ${p.slice(10)}`;

Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (req.method === "GET") {
    if (url.searchParams.get("key") !== WEBHOOK_SECRET) return new Response("not found", { status: 404 });
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: PUBLIC_URL, secret_token: WEBHOOK_SECRET, drop_pending_updates: true }),
    });
    return new Response(JSON.stringify(await r.json(), null, 2), { headers: { "content-type": "application/json" } });
  }

  if (req.headers.get("x-telegram-bot-api-secret-token") !== WEBHOOK_SECRET) {
    return new Response("unauthorized", { status: 401 });
  }

  let chatId: number | undefined;
  try {
    const update = await req.json();
    const msg = update.message;
    chatId = msg?.chat?.id;
    if (msg?.contact && msg.contact.user_id === msg.from?.id) {
      const phone = normalizePhone(msg.contact.phone_number);
      if (!phone) {
        await tgSend(msg.chat.id, "Kechirasiz, faqat O‘zbekiston (+998) raqamlari qabul qilinadi.", { remove_keyboard: true });
      } else {
        await sql`insert into telegram_links (phone, chat_id, telegram_username, linked_at)
                  values (${phone}, ${msg.chat.id}, ${msg.from?.username ?? null}, now())
                  on conflict (phone) do update set chat_id = excluded.chat_id,
                    telegram_username = excluded.telegram_username, linked_at = now()`;
        const code = genCode();
        await sql`insert into otp_codes (phone, code_hash, expires_at)
                  values (${phone}, ${await sha256Hex(code)}, now() + interval '5 minutes')`;
        await tgSend(
          msg.chat.id,
          `✅ <b>${pretty(phone)}</b> raqami tasdiqlandi!\n\n<b>Daywork.uz</b> tasdiqlash kodi: <b>${code}</b>\n\nKod 5 daqiqa amal qiladi. Bu kodni hech kimga bermang.\n\n<i>Saytda ham aynan shu raqamni kiriting.</i>`,
          { remove_keyboard: true },
        );
      }
    } else if (typeof msg?.text === "string" && msg.text.startsWith("/start")) {
      await tgSend(
        msg.chat.id,
        "👋 Daywork.uz botiga xush kelibsiz!\n\nTelefon raqamingizni tasdiqlash uchun pastdagi tugmani bosing.",
        { keyboard: [[{ text: "📱 Telefon raqamni yuborish", request_contact: true }]], resize_keyboard: true, one_time_keyboard: true },
      );
    }
  } catch (e) {
    console.error("telegram-webhook error", e);
    if (chatId) await tgSend(chatId, "Xatolik yuz berdi, birozdan keyin qayta urinib ko‘ring.").catch(() => {});
  }
  // Always ack so Telegram doesn't retry-storm.
  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
});
