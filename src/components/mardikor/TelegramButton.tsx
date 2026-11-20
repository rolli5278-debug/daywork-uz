import { useState } from "react";
import { Send, Bell, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { telegramUrl } from "@/lib/telegram";

type Variant = "icon" | "full";

/** "Telegram botga o‘tish" button. Opens the bot when VITE_TELEGRAM_BOT is set, otherwise a demo dialog. */
export function TelegramButton({ variant = "full", start, className }: { variant?: Variant; start?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const url = telegramUrl(start);
  const look = variant === "icon"
    ? "grid h-9 w-9 place-items-center rounded-full bg-telegram text-white transition hover:opacity-90"
    : "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-telegram px-6 text-sm font-medium text-white shadow transition hover:opacity-90";
  const inner = variant === "icon" ? <Send className="h-4 w-4" /> : <><Send className="h-4 w-4" /> Telegram botga o‘tish</>;

  if (url) return <a href={url} target="_blank" rel="noopener noreferrer" className={cn(look, className)} aria-label="Telegram botga o‘tish">{inner}</a>;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cn(look, className)} aria-label="Telegram botga o‘tish" title="Telegram bot (demo)">{inner}</button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-telegram text-white"><Send className="h-6 w-6" /></div>
            <DialogTitle>Daywork.uz Telegram boti</DialogTitle>
            <DialogDescription>Demo rejim: bot hali ulanmagan. Ishga tushgach, shu tugma to‘g‘ridan-to‘g‘ri botni ochadi.</DialogDescription>
          </DialogHeader>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><Bell className="h-5 w-5 shrink-0 text-telegram" />Tumaningizdagi yangi zayavkalar haqida darhol xabar</li>
            <li className="flex gap-3"><MessageSquare className="h-5 w-5 shrink-0 text-telegram" />Zayavkangiz qabul qilinganda va ish yakunlanganda bildirishnoma</li>
            <li className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-telegram" />Kirish kodlari va parolni tiklash botda</li>
          </ul>
          <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
            Dasturchi uchun: <code>.env</code> faylida <code>VITE_TELEGRAM_BOT=bot_nomi</code> ni belgilang — tugma <code>t.me/bot_nomi</code> ga yo‘naltiradi.
          </div>
          <Button onClick={() => setOpen(false)}>Tushunarli</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
