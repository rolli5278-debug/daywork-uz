import { useHead } from "@/lib/head";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Ban, Eye, EyeOff, KeyRound, Search, ShieldCheck, ShieldOff, Unlock, Users, Flag, MessageSquare, Briefcase, LifeBuoy, BookOpen } from "lucide-react";
import { AppHeader } from "@/components/mardikor/AppHeader";
import { RatingLabel, Stars } from "@/components/mardikor/Stars";
import { fmtDate } from "@/components/mardikor/ReviewList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { store, users, type User } from "@/lib/mardikor";
import { adminResetPassword } from "@/lib/auth";
import { complaintStore, reviewStore, statsFor, type Complaint, type ComplaintStatus } from "@/lib/reviews";
import { tickets as ticketStore, faq, type TicketStatus } from "@/lib/support";
import { TicketStatusBadge } from "@/components/mardikor/TicketStatusBadge";

const STATUS: Record<ComplaintStatus, { t: string; cls: string }> = {
  new: { t: "Yangi", cls: "bg-accent text-accent-foreground hover:bg-accent" },
  resolved: { t: "Tasdiqlandi", cls: "bg-destructive text-white hover:bg-destructive" },
  rejected: { t: "Rad etildi", cls: "" },
};

export default function Admin() {
  useHead("Admin panel — Daywork.uz", "Foydalanuvchilar, shikoyatlar va izohlarni boshqarish.");
  const nav = useNavigate();
  const [me, setMe] = useState<User | null>(null);
  const [tick, setTick] = useState(0);
  const [q, setQ] = useState("");
  const [cFilter, setCFilter] = useState<ComplaintStatus | "all">("new");
  const [handling, setHandling] = useState<Complaint | null>(null);
  const [note, setNote] = useState("");
  const [tempPw, setTempPw] = useState<{ name: string; pw: string } | null>(null);
  const refresh = () => setTick((n) => n + 1);

  useEffect(() => {
    const p = store.profile();
    if (!p) { nav("/kirish"); return; }
    if (p.role !== "admin") { toast.error("Bu sahifa faqat administratorlar uchun."); nav("/"); return; }
    if (p.mustChangePw) { toast.warning("Avval standart parolni o‘zgartiring."); nav("/profil"); return; }
    setMe(p);
  }, [nav]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const all = useMemo(() => users.all(), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const complaints = useMemo(() => complaintStore.all(), [tick]);
  const [tFilter, setTFilter] = useState<TicketStatus | "all" | "mine">("open");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tix = useMemo(() => ticketStore.all(), [tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reviews = useMemo(() => reviewStore.allForAdmin().sort((a, b) => b.at - a.at), [tick]);
  if (!me) return null;

  const admins = all.filter((u) => u.role === "admin");
  const list = all.filter((u) => !q || [u.name, u.id, u.phone].some((v) => v.toLowerCase().includes(q.toLowerCase())));
  const jobs = store.jobs(); const acc = store.acceptances();
  const cList = complaints.filter((c) => cFilter === "all" || c.status === cFilter);

  const act = (u: User, patch: Partial<User>, msg: string) => { users.update(u.id, patch); refresh(); toast.success(msg); };
  const toggleBlock = (u: User) => {
    if (u.id === me.id) { toast.error("O‘zingizni bloklay olmaysiz."); return; }
    act(u, { blocked: !u.blocked }, u.blocked ? `${u.name} blokdan chiqarildi` : `${u.name} bloklandi`);
  };
  const toggleAdmin = (u: User) => {
    if (u.role === "admin") {
      if (u.id === me.id) { toast.error("O‘zingizdan admin huquqini ololmaysiz."); return; }
      if (admins.length <= 1) { toast.error("Tizimda kamida bitta admin qolishi kerak."); return; }
      act(u, { role: "user", adminTitle: undefined }, `${u.name} endi oddiy foydalanuvchi`);
    } else act(u, { role: "admin", adminTitle: "Administrator" }, `${u.name} administrator qilindi`);
  };
  const unlock = (u: User) => act(u, { lockUntil: 0, failed: 0 }, `${u.name} qulfdan chiqarildi`);
  const resetPw = async (u: User) => {
    const pw = await adminResetPassword(u.id);
    setTempPw({ name: u.name, pw }); refresh();
  };
  const decide = (status: ComplaintStatus) => {
    if (!handling) return;
    complaintStore.setStatus(handling.id, status, note, me.name);
    toast.success(status === "resolved" ? "Shikoyat tasdiqlandi" : "Shikoyat rad etildi");
    setHandling(null); setNote(""); refresh();
  };

  const stat = [
    { i: Users, t: "Foydalanuvchilar", v: all.length, d: `${admins.length} admin · ${all.filter((u) => u.blocked).length} bloklangan` },
    { i: Briefcase, t: "Zayavkalar", v: jobs.length, d: `${acc.filter((a) => a.status === "done").length} ta ish yakunlangan` },
    { i: MessageSquare, t: "Izohlar", v: reviews.length, d: `${reviews.filter((r) => r.hidden).length} ta yashirilgan` },
    { i: Flag, t: "Shikoyatlar", v: complaints.length, d: `${complaints.filter((c) => c.status === "new").length} ta yangi` },
    { i: LifeBuoy, t: "Murojaatlar", v: tix.length, d: `${tix.filter((x) => x.status === "open").length} ta javob kutmoqda` },
    { i: BookOpen, t: "FAQ", v: faq.all().length, d: `${faq.published().length} ta ulashilgan` },
  ];

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"><ShieldCheck className="h-3.5 w-3.5" />{me.adminTitle ?? "Administrator"}</span>
            <h1 className="mt-3 text-3xl font-bold">Admin panel</h1>
          </div>
          <p className="text-sm text-muted-foreground">Kirgan: <b className="text-foreground">{me.name}</b> · {me.id}</p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stat.map(({ i: I, t, v, d }) => (
            <div key={t} className="rounded-2xl border bg-card p-5">
              <I className="h-5 w-5 text-primary" />
              <div className="mt-3 font-display text-3xl font-bold">{v}</div>
              <div className="text-sm font-semibold">{t}</div>
              <div className="text-xs text-muted-foreground">{d}</div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="support" className="mt-8">
          <TabsList className="flex-wrap">
            <TabsTrigger value="support">Murojaatlar ({tix.filter((x) => x.status === "open").length})</TabsTrigger>
            <TabsTrigger value="complaints">Shikoyatlar ({complaints.filter((c) => c.status === "new").length})</TabsTrigger>
            <TabsTrigger value="users">Foydalanuvchilar ({all.length})</TabsTrigger>
            <TabsTrigger value="admins">Adminlar ({admins.length})</TabsTrigger>
            <TabsTrigger value="reviews">Izohlar ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="support" className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {(["open", "answered", "closed", "mine", "all"] as const).map((f) => (
                <Button key={f} size="sm" variant={tFilter === f ? "default" : "secondary"} onClick={() => setTFilter(f)}>
                  {{ open: "Javob kutmoqda", answered: "Javob berilgan", closed: "Yopilgan", mine: "Menga biriktirilgan", all: "Barchasi" }[f]}
                </Button>
              ))}
              <Link to="/profil#faq" className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"><BookOpen className="h-4 w-4" />FAQ boshqaruvi</Link>
            </div>
            {(() => {
              const tl = tix.filter((x) => tFilter === "all" || (tFilter === "mine" ? x.assignedTo === me.id : x.status === tFilter));
              if (!tl.length) return <p className="py-10 text-center text-muted-foreground">Murojaatlar yo‘q.</p>;
              return (
                <div className="divide-y rounded-2xl border bg-card">
                  {tl.map((x) => (
                    <Link key={x.id} to={`/yordam/${x.id}`} className="flex flex-wrap items-center gap-3 p-4 transition hover:bg-muted/50">
                      {x.unreadAdmin && x.status !== "closed" && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" aria-label="Yangi" />}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">#{x.number} · {x.subject}</div>
                        <div className="text-xs text-muted-foreground">{x.userName} · {x.category} · {x.messages.length} xabar · {fmtDate(x.updatedAt)}{x.assignedName ? ` · Mas’ul: ${x.assignedName}` : ""}</div>
                      </div>
                      <TicketStatusBadge status={x.status} />
                    </Link>
                  ))}
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="complaints" className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {(["new", "resolved", "rejected", "all"] as const).map((f) => (
                <Button key={f} size="sm" variant={cFilter === f ? "default" : "secondary"} onClick={() => setCFilter(f)}>
                  {f === "all" ? "Barchasi" : STATUS[f].t}
                </Button>
              ))}
            </div>
            {cList.length === 0 && <p className="py-10 text-center text-muted-foreground">Shikoyatlar yo‘q.</p>}
            {cList.map((c) => (
              <div key={c.id} className="rounded-2xl border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="font-semibold">{c.reason}</div>
                  <Badge variant={c.status === "rejected" ? "secondary" : "default"} className={STATUS[c.status].cls}>{STATUS[c.status].t}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  <Link to={`/u/${c.fromId}`} className="font-medium text-foreground hover:underline">{c.fromName}</Link> →{" "}
                  <Link to={`/u/${c.againstId}`} className="font-medium text-foreground hover:underline">{c.againstName}</Link> · {c.jobTitle} · {fmtDate(c.at)}
                </p>
                <p className="mt-3 rounded-xl bg-muted p-3 text-sm">{c.text}</p>
                {c.adminNote && <p className="mt-2 text-xs text-muted-foreground">Admin izohi ({c.handledBy}): {c.adminNote}</p>}
                {c.status === "new" && <Button size="sm" className="mt-3" onClick={() => setHandling(c)}>Ko‘rib chiqish</Button>}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="users" className="mt-4 space-y-3">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Ism, ID yoki telefon" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <UserRows rows={list} me={me} onBlock={toggleBlock} onAdmin={toggleAdmin} onReset={resetPw} onUnlock={unlock} />
          </TabsContent>

          <TabsContent value="admins" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">Tizim administratorlari. Oddiy foydalanuvchini admin qilish uchun “Foydalanuvchilar” bo‘limidan foydalaning.</p>
            <UserRows rows={admins} me={me} onBlock={toggleBlock} onAdmin={toggleAdmin} onReset={resetPw} onUnlock={unlock} />
          </TabsContent>

          <TabsContent value="reviews" className="mt-4 space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className={`rounded-2xl border bg-card p-4 ${r.hidden ? "opacity-60" : ""}`}>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Stars value={r.stars} size={14} /><b>{r.fromName}</b> →
                  <Link to={`/u/${r.toId}`} className="font-semibold text-primary hover:underline">{r.toName}</Link>
                  {r.hidden && <Badge variant="secondary">Yashirilgan</Badge>}
                  <span className="ml-auto text-xs text-muted-foreground">{fmtDate(r.at)}</span>
                </div>
                {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">{r.jobTitle}</span>
                  <Button size="sm" variant="ghost" onClick={() => { reviewStore.setHidden(r.id, !r.hidden); refresh(); }}>
                    {r.hidden ? <><Eye /> Ko‘rsatish</> : <><EyeOff /> Yashirish</>}
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!handling} onOpenChange={(o) => !o && setHandling(null)}>
        {handling && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Shikoyatni ko‘rib chiqish</DialogTitle>
              <DialogDescription>{handling.fromName} → {handling.againstName} · {handling.reason}</DialogDescription>
            </DialogHeader>
            <p className="rounded-xl bg-muted p-3 text-sm">{handling.text}</p>
            <Textarea placeholder="Qaror izohi (ixtiyoriy)" value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} />
            <p className="text-xs text-muted-foreground">Tasdiqlangan shikoyat foydalanuvchining ommaviy profilida “Tasdiqlangan shikoyatlar” soniga qo‘shiladi.</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => decide("rejected")}>Rad etish</Button>
              <Button variant="destructive" onClick={() => decide("resolved")}>Tasdiqlash</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={!!tempPw} onOpenChange={(o) => !o && setTempPw(null)}>
        {tempPw && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Vaqtinchalik parol</DialogTitle>
              <DialogDescription>{tempPw.name} uchun. Bu parol faqat hozir ko‘rsatiladi — foydalanuvchiga xavfsiz yo‘l bilan yetkazing. Kirgach, u parolni o‘zgartirishga majbur bo‘ladi.</DialogDescription>
            </DialogHeader>
            <code className="rounded-xl bg-muted p-4 text-center font-mono text-xl tracking-wider select-all">{tempPw.pw}</code>
            <Button onClick={() => { navigator.clipboard?.writeText(tempPw.pw).then(() => toast.success("Nusxalandi"), () => {}); }}>Nusxalash</Button>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function UserRows({ rows, me, onBlock, onAdmin, onReset, onUnlock }: {
  rows: User[]; me: User; onBlock: (u: User) => void; onAdmin: (u: User) => void; onReset: (u: User) => void; onUnlock: (u: User) => void;
}) {
  if (!rows.length) return <p className="py-10 text-center text-muted-foreground">Topilmadi.</p>;
  return (
    <div className="divide-y rounded-2xl border bg-card">
      {rows.map((u) => {
        const s = statsFor(u.id);
        const locked = u.lockUntil > Date.now();
        return (
          <div key={u.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/u/${u.id}`} className="font-semibold hover:underline">{u.name}</Link>
                {u.role === "admin" && <Badge className="gap-1"><ShieldCheck className="h-3 w-3" />{u.adminTitle ?? "Admin"}</Badge>}
                {u.blocked && <Badge variant="destructive">Bloklangan</Badge>}
                {locked && <Badge variant="secondary">Vaqtincha qulflangan</Badge>}
                {u.mustChangePw && <Badge variant="outline">Parol almashtirilishi kerak</Badge>}
                {u.id === me.id && <Badge variant="outline">Siz</Badge>}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">{u.id} · {u.phone} · {u.district}, {u.region} · {u.completed} ish</div>
            </div>
            <RatingLabel avg={s.avg} count={s.count} />
            <div className="flex flex-wrap gap-1">
              {locked && <Button size="sm" variant="ghost" onClick={() => onUnlock(u)} title="Qulfni olish"><Unlock /></Button>}
              <Button size="sm" variant="ghost" onClick={() => onReset(u)} title="Vaqtinchalik parol berish"><KeyRound /></Button>
              <Button size="sm" variant="ghost" onClick={() => onAdmin(u)} title={u.role === "admin" ? "Admin huquqini olish" : "Admin qilish"}>
                {u.role === "admin" ? <ShieldOff /> : <ShieldCheck />}
              </Button>
              <Button size="sm" variant="ghost" className={u.blocked ? "" : "text-destructive hover:text-destructive"} onClick={() => onBlock(u)} title={u.blocked ? "Blokdan chiqarish" : "Bloklash"}>
                {u.blocked ? <Unlock /> : <Ban />}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
