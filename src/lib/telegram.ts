// Telegram bot link. The real bot (@DayWork_notify_bot) is the default, so the button always opens it,
// even if the hosting has no env variable set. VITE_TELEGRAM_BOT=<bot_username> (without @) can still
// override it, e.g. for a test bot. Set VITE_TELEGRAM_BOT=off to get the old demo dialog back.
const DEFAULT_BOT = "DayWork_notify_bot";
const fromEnv = ((import.meta.env.VITE_TELEGRAM_BOT as string | undefined) ?? "").replace(/^@/, "").trim();
export const TELEGRAM_BOT = fromEnv.toLowerCase() === "off" ? "" : fromEnv || DEFAULT_BOT;
export const telegramUrl = (start?: string) =>
  TELEGRAM_BOT ? `https://t.me/${TELEGRAM_BOT}${start ? `?start=${encodeURIComponent(start)}` : ""}` : null;
