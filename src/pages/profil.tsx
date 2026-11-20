import { useHead } from "@/lib/head";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ExternalLink, KeyRound, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/mardikor/AppHeader";
import { PasswordInput, PasswordRules } from "@/components/mardikor/PasswordField";
import { RatingLabel } from "@/components/mardikor/Stars";
import { TelegramButton } from "@/components/mardikor/TelegramButton";
import { FaqManager } from "@/components/mardikor/FaqManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REGIONS, store, users, type User } from "@/lib/mardikor";
import { changePassword, passwordIssues } from "@/lib/auth";
import { statsFor } from "@/lib/reviews";

export default function Profil() {
  useHead("Profil va xavfsizlik — Daywork.uz", "Shaxsiy ma’lumotlar va parolni o‘zgartirish.");
  const nav = useNavigate();
  const loc = useLocation();
  const prefill = (loc.state as { faqPrefill?: { question: string; answer: string } } | null)?.faqPrefill;
  const [p, setP] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [next2, setNext2] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const x = store.profile();
    if (!x) { nav("/kirish"); return; }
    setP(x); setName(x.name); setRegion(x.region); setDistrict(x.district);
  }, [nav]);
  useEffect(() => {
    if (p && loc.hash === "#faq") setTimeout(() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [p, loc.hash]);
  if (!p) return null;

  const infoChanged = name.trim() !== p.name || region !== p.region || district !== p.district;
  const saveInfo = () => {
    if (name.trim().length < 3 || !district) { toast.error("Ism va tumanni to‘ldiring."); return; }
    users.update(p.id, { name: name.trim(), region, district });
    setP(store.profile()); toast.success("Ma’lumotlar saqlandi");
  };

  const pwOk = !!cur && passwordIssues(next, p.phone).length === 0 && next === next2;
  const savePw = async () => {
    setBusy(true);
    const r = await changePassword(p.id, cur, next);
    setBusy(false);
    if (!r.ok) { toast.error(r.error); return; }
    setCur(""); setNext(""); setNext2(""); setP(r.user);
    toast.success("Parol o‘zgartirildi");
  };
  const s = statsFor(p.id);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Profil</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              ID: <b className="text-foreground">{p.id}</b> · {p.phone}
              {p.role === "admin" && <Badge className="gap-1"><ShieldCheck className="h-3.5 w-3.5" />{p.adminTitle ?? "Administrator"}</Badge>}
            </p>
          </div>
          <Link to={`/u/${p.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            Ommaviy profilim <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        {p.mustChangePw && (
          <div className="flex gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
            <div><b>Parolni o‘zgartiring.</b> Siz vaqtinchalik (yoki standart) parol bilan kirdingiz. Davom etishdan oldin shaxsiy parol o‘rnating.</div>
          </div>
        )}

        <section className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Shaxsiy ma’lumotlar</h2>
            <RatingLabel avg={s.avg} count={s.count} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2"><Label>Ism-familiya</Label><Input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Viloyat</Label>
              <Select value={region} onValueChange={(v) => { setRegion(v); setDistrict(""); }}>
                <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>{Object.keys(REGIONS).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Tuman</Label>
              <Select value={district} onValueChange={setDistrict} disabled={!region}>
                <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>{(REGIONS[region] ?? []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Telefon raqam login sifatida ishlatiladi va o‘zgartirilmaydi.</p>
          <Button className="mt-4" disabled={!infoChanged} onClick={saveInfo}>Saqlash</Button>
        </section>

        <section className="rounded-2xl border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><KeyRound className="h-5 w-5 text-primary" />Parolni o‘zgartirish</h2>
          <form className="mt-4 max-w-sm space-y-4" onSubmit={(e) => { e.preventDefault(); if (pwOk) savePw(); }}>
            {/* hidden username helps password managers pair the new password with the right account */}
            <input type="text" name="username" autoComplete="username" value={p.phone} readOnly hidden />
            <div className="space-y-1.5"><Label htmlFor="cur">Joriy parol</Label><PasswordInput id="cur" value={cur} onChange={setCur} autoComplete="current-password" /></div>
            <div className="space-y-1.5"><Label htmlFor="new">Yangi parol</Label><PasswordInput id="new" value={next} onChange={setNext} autoComplete="new-password" /></div>
            <PasswordRules value={next} phone={p.phone} />
            <div className="space-y-1.5"><Label htmlFor="new2">Yangi parolni takrorlang</Label><PasswordInput id="new2" value={next2} onChange={setNext2} autoComplete="new-password" /></div>
            {next2 && next !== next2 && <p className="text-xs text-destructive">Parollar mos kelmadi</p>}
            <Button type="submit" disabled={!pwOk || busy}>{busy && <Loader2 className="animate-spin" />}Parolni yangilash</Button>
          </form>
        </section>

        {p.role === "admin" && !p.mustChangePw && <FaqManager admin={p} prefill={prefill} />}

        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-6">
          <div>
            <h2 className="text-lg font-semibold">Telegram bildirishnomalari</h2>
            <p className="mt-1 text-sm text-muted-foreground">Yangi zayavkalar va ish holati haqida xabar oling.</p>
          </div>
          <TelegramButton start={p.id} />
        </section>

        <Button variant="ghost" onClick={() => { store.logout(); nav("/"); }}><LogOut /> Chiqish</Button>
      </main>
    </div>
  );
}
