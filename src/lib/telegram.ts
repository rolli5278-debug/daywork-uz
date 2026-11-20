// Telegram bot link. Set VITE_TELEGRAM_BOT=<bot_username> (without @) in a .env file to make the
// button open the real bot. While it is empty the app runs in demo mode and shows an info dialog.
export const TELEGRAM_BOT = ((import.meta.env.VITE_TELEGRAM_BOT as string | undefined) ?? "").replace(/^@/, "").trim();
export const telegramUrl = (start?: string) =>
  TELEGRAM_BOT ? `https://t.me/${TELEGRAM_BOT}${start ? `?start=${encodeURIComponent(start)}` : ""}` : null;
