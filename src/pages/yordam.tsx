import { useHead } from "@/lib/head";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, LifeBuoy, Link2, MessageSquarePlus, Search } from "lucide-react";
import { AppHeader } from "@/components/mardikor/AppHeader";
import { TelegramButton } from "@/components/mardikor/TelegramButton";
import { TicketStatusBadge } from "@/components/mardikor/TicketStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { store, type User } from "@/lib/mardikor";
import { MAX_MESSAGE, MAX_OPEN_TICKETS, TICKET_CATEGORIES, faq, faqLink, tickets, type Ticket } from "@/lib/support";
import { fmtDate } from "@/components/mardikor/ReviewList";
import { cn } from "@/lib/utils";

export default function Yordam() {
  useHead("Yordam markazi — Daywork.uz", "Ko‘p beriladigan savollar va administratorga murojaat.");
  const nav = useNavigate();
  const { hash } = useLocation();
  const [p, setP] = useState<User | null>(null);
  const [mine, setMine] = useState<Ticket[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [f, setF] = useState({ category: "", subject: "", text: "" });
  const items = useMemo(() => faq.published(), []);

  useEffect(() => { const x = store.profile(); setP(x); if (x) setMine(tickets.mine(x.id)); }, []);
  // Shared FAQ link (/yordam#<id>): open and scroll to that question.
  useEffect(() => {
    const id = decodeURIComponent(hash.slice(1));
    if (!id) return;
    if (id === "murojaat") { document.getElementById("murojaat")?.scrollIntoView({ behavior: "smooth" }); return; }
    if (items.some((i) => i.id === id)) {
      setOpenId(id);
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    }
  }, [hash, items]);

  const cats = [...new Set(items.map((i) => i.category))];
  const shown = items.filter((i) => (cat === "all" || i.category === cat) &&
    (!q || (i.question + " " + i.answer).toLowerCase().includes(q.toLowerCase())));

  const copy = (id: string) => navigator.clipboard?.writeText(faqLink(id)).then(() => toast.success("Havola nusxalandi"), () => toast.error("Nusxalab bo‘lmadi"));

  const submit = () => {
    if (!p) return;
    const r = tickets.create(p, f);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success(`Murojaat #${r.value.number} yuborildi. Javob shu yerda va sarlavhadagi belgida ko‘rinadi.`);
    nav(`/yordam/${r.value.id}`);
  };
  const openCount = mine.filter((t) => t.status !== "closed").length;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"><LifeBuoy className="h-3.5 w-3.5" />Yordam markazi</span>
        <h1 className="mt-4 text-3xl font-bold">Qanday yordam bera olamiz?</h1>
        <div className="relative mt-5 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-11 pl-9" placeholder="Savolingizni yozing, masalan: parol" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <section>
            <div className="flex flex-wrap gap-2">
              {["all", ...cats].map((c) => (
                <Button key={c} size="sm" variant={cat === c ? "default" : "secondary"} onClick={() => setCat(c)}>{c === "all" ? "Barchasi" : c}</Button>
              ))}
            </div>
            <ul className="mt-4 space-y-2">
              {shown.map((i) => {
                const open = openId === i.id;
                return (
                  <li key={i.id} id={i.id} className={cn("rounded-2xl border bg-card transition", open && "border-primary")}>
                    <button className="flex w-full items-center justify-between gap-3 p-4 text-left font-semibold" aria-expanded={open} onClick={() => setOpenId(open ? null : i.id)}>
                      {i.question}
                      <ChevronDown className={cn("h-4 w-4 shrink-0 transition", open && "rotate-180")} />
                    </button>
                    {open && (
                      <div className="px-4 pb-4">
                        <p className="whitespace-pre-line text-sm text-muted-foreground">{i.answer}</p>
                        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span>{i.category}</span>
                          <button onClick={() => copy(i.id)} className="inline-flex items-center gap-1 text-primary hover:underline"><Link2 className="h-3.5 w-3.5" />Havolani nusxalash</button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            {shown.length === 0 && <p className="py-10 text-center text-muted-foreground">Hech narsa topilmadi. Pastdagi forma orqali bizga yozing.</p>}
          </section>

          <aside className="space-y-6">
            <section id="murojaat" className="rounded-3xl border bg-card p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold"><MessageSquarePlus className="h-5 w-5 text-primary" />Adminga murojaat</h2>
              {!p ? (
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <p>Murojaat yuborish va javobni kuzatish uchun hisobingizga kiring.</p>
                  <Button asChild><Link to="/kirish">Kirish</Link></Button>
                </div>
              ) : openCount >= MAX_OPEN_TICKETS ? (
                <p className="mt-3 text-sm text-muted-foreground">Sizda {openCount} ta ochiq murojaat bor. Yangi murojaat uchun avvalgilaridan birini yoping.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="space-y-1.5"><Label>Bo‘lim</Label>
                    <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                      <SelectContent>{TICKET_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label htmlFor="t-subj">Mavzu</Label><Input id="t-subj" maxLength={100} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="Qisqacha mavzu" /></div>
                  <div className="space-y-1.5">
                    <Label htmlFor="t-text">Xabar</Label>
                    <Textarea id="t-text" rows={5} maxLength={MAX_MESSAGE} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} placeholder="Muammoni batafsil yozing" />
                    <p className="text-right text-xs text-muted-foreground">{f.text.length} / {MAX_MESSAGE}</p>
                  </div>
                  <Button className="w-full" disabled={!f.category || f.subject.trim().length < 5 || f.text.trim().length < 10} onClick={submit}>Yuborish</Button>
                </div>
              )}
              <div className="mt-5 border-t pt-4 text-center">
                <p className="mb-2 text-xs text-muted-foreground">Yoki Telegram orqali</p>
                <TelegramButton start="support" />
              </div>
            </section>

            {p && mine.length > 0 && (
              <section className="rounded-3xl border bg-card p-6">
                <h2 className="text-lg font-semibold">Mening murojaatlarim</h2>
                <ul className="mt-3 divide-y">
                  {mine.map((t) => (
                    <li key={t.id}>
                      <Link to={`/yordam/${t.id}`} className="flex items-center gap-3 py-3 text-sm hover:text-primary">
                        {t.unreadUser && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Yangi javob" />}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">#{t.number} · {t.subject}</span>
                          <span className="text-xs text-muted-foreground">{fmtDate(t.updatedAt)}</span>
                        </span>
                        <TicketStatusBadge status={t.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
