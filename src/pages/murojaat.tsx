import { useHead } from "@/lib/head";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, BookPlus, Lock, Send, ShieldCheck, UserCheck } from "lucide-react";
import { AppHeader } from "@/components/mardikor/AppHeader";
import { TicketStatusBadge } from "@/components/mardikor/TicketStatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { store, type User } from "@/lib/mardikor";
import { MAX_MESSAGE, canAccess, tickets, type Ticket } from "@/lib/support";
import { cn } from "@/lib/utils";

const time = (t: number) => new Date(t).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/** One support ticket conversation. Visible to its author and to admins only. */
export default function Murojaat() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const [me, setMe] = useState<User | null>(null);
  const [t, setT] = useState<Ticket | null>(null);
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useHead(t ? `#${t.number} ${t.subject} — Daywork.uz` : "Murojaat — Daywork.uz", "Administrator bilan yozishma.");

  useEffect(() => {
    const u = store.profile();
    if (!u) { nav("/kirish"); return; }
    setMe(u);
    const x = tickets.byId(id);
    if (x && canAccess(x, u)) { tickets.markRead(id, u); setT(tickets.byId(id)); }
    setLoaded(true);
  }, [id, nav]);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [t?.messages.length]);

  if (!me || !loaded) return null;
  if (!t) return (
    <div className="min-h-screen"><AppHeader />
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Murojaat topilmadi</h1>
        <p className="mt-2 text-muted-foreground">Bunday murojaat yo‘q yoki uni ko‘rishga ruxsatingiz yo‘q.</p>
        <Link to="/yordam" className="mt-4 inline-block text-primary underline">Yordam markaziga qaytish</Link>
      </main>
    </div>
  );

  const admin = me.role === "admin";
  const reload = () => setT(tickets.byId(id));
  const send = () => {
    const err = tickets.reply(id, me, text);
    if (err) { toast.error(err); return; }
    setText(""); reload();
  };
  const status = (s: Ticket["status"]) => {
    const err = tickets.setStatus(id, me, s);
    if (err) { toast.error(err); return; }
    toast.success(s === "closed" ? "Murojaat yopildi" : "Murojaat qayta ochildi"); reload();
  };
  const toFaq = () => {
    const q = t.messages[0]?.text ?? t.subject;
    const a = [...t.messages].reverse().find((m) => m.fromAdmin)?.text ?? "";
    nav("/profil#faq", { state: { faqPrefill: { question: t.subject.endsWith("?") ? t.subject : q.slice(0, 200), answer: a } } });
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link to={admin ? "/admin" : "/yordam"} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />{admin ? "Admin panel" : "Yordam markazi"}
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">#{t.number} · {t.category}</p>
            <h1 className="mt-1 text-2xl font-bold">{t.subject}</h1>
            {admin && (
              <p className="mt-1 text-sm text-muted-foreground">
                Muallif: <Link to={`/u/${t.userId}`} className="font-medium text-foreground hover:underline">{t.userName}</Link> ({t.userId})
                {t.assignedName && <> · Mas’ul: <b className="text-foreground">{t.assignedName}</b></>}
              </p>
            )}
          </div>
          <TicketStatusBadge status={t.status} />
        </div>

        {admin && (
          <div className="mt-4 flex flex-wrap gap-2">
            {t.assignedTo !== me.id && <Button size="sm" variant="secondary" onClick={() => { tickets.assign(id, me); reload(); toast.success("Murojaat sizga biriktirildi"); }}><UserCheck /> O‘zimga olish</Button>}
            <Button size="sm" variant="secondary" onClick={toFaq}><BookPlus /> FAQ’ga aylantirish</Button>
          </div>
        )}

        <div className="mt-6 space-y-3 rounded-3xl border bg-card p-4 sm:p-6">
          {t.messages.map((m) => {
            const mineMsg = m.authorId === me.id;
            return (
              <div key={m.id} className={cn("flex", mineMsg ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm", mineMsg ? "bg-primary text-primary-foreground" : m.fromAdmin ? "bg-accent/30" : "bg-muted")}>
                  <div className={cn("mb-1 flex items-center gap-1 text-xs font-semibold", mineMsg ? "opacity-80" : "text-muted-foreground")}>
                    {m.fromAdmin && <ShieldCheck className="h-3.5 w-3.5" />}{mineMsg ? "Siz" : m.authorName} · {time(m.at)}
                  </div>
                  <p className="whitespace-pre-line break-words">{m.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={end} />
        </div>

        {t.status === "closed" ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted p-4 text-sm">
            <span className="flex items-center gap-2"><Lock className="h-4 w-4" />Murojaat yopilgan.</span>
            {admin ? <Button size="sm" onClick={() => status("open")}>Qayta ochish</Button>
              : <Link to="/yordam#murojaat" className="text-primary hover:underline">Yangi murojaat yuborish</Link>}
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            <Textarea rows={3} maxLength={MAX_MESSAGE} value={text} onChange={(e) => setText(e.target.value)}
              placeholder={admin ? "Foydalanuvchiga javob yozing…" : "Xabar yozing…"}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && text.trim()) send(); }} />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={() => status("closed")}><Lock /> {admin ? "Murojaatni yopish" : "Muammo hal bo‘ldi — yopish"}</Button>
              <Button disabled={text.trim().length < 2} onClick={send}><Send /> Yuborish</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
