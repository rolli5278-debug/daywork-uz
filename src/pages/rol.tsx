import { useHead } from "@/lib/head";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Briefcase, HardHat, LifeBuoy, LogOut, Settings, ShieldCheck, Trophy } from "lucide-react";
import { AppHeader } from "@/components/mardikor/AppHeader";
import { Button } from "@/components/ui/button";
import { formatSum, store, type User } from "@/lib/mardikor";


export default function Rol() {
  useHead("Rolni tanlang — Daywork.uz", "Ish qoldirmoqchimisiz yoki ish qidiryapsizmi? Rolni tanlang.");
  const nav = useNavigate();
  const [p, setP] = useState<User | null>(null);
  useEffect(() => { const x = store.profile(); if (!x) nav("/kirish"); else setP(x); }, [nav]);
  if (!p) return null;
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5">
          <div>
            <div className="text-sm text-muted-foreground">Salom,</div>
            <div className="font-display text-xl font-bold">{p.name}</div>
            <div className="text-sm text-muted-foreground">{p.district}, {p.region}</div>
          </div>
          <div className="text-right text-sm">
            <div>ID: <b>{p.id}</b></div>
            <div>Balans: <b>{formatSum(p.balance)}</b></div>
            <div>Yakunlangan ishlar: <b>{p.completed}</b></div>
          </div>
        </div>
        <h1 className="mt-10 text-3xl font-bold">Bugun nima qilamiz?</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link to="/zayavka-yangi" className="group rounded-3xl bg-primary p-7 text-primary-foreground transition hover:-translate-y-1">
            <Briefcase className="h-10 w-10" />
            <h2 className="mt-6 text-2xl font-bold">Ish qoldirmoqchiman</h2>
            <p className="mt-2 opacity-80">Ish beruvchi sifatida zayavka yarating. Bepul.</p>
          </Link>
          <Link to="/zayavkalar" className="group rounded-3xl bg-accent p-7 text-accent-foreground transition hover:-translate-y-1">
            <HardHat className="h-10 w-10" />
            <h2 className="mt-6 text-2xl font-bold">Ish qidiryapman</h2>
            <p className="mt-2 opacity-80">Tumaningizdagi zayavkalarni ko‘ring va qabul qiling.</p>
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button asChild variant="secondary"><Link to="/profil"><Settings /> Profil va parol</Link></Button>
          <Button asChild variant="secondary"><Link to="/reyting"><Trophy /> Reyting</Link></Button>
          <Button asChild variant="secondary"><Link to="/yordam"><LifeBuoy /> Yordam / murojaat</Link></Button>
          {p.role === "admin" && <Button asChild variant="secondary"><Link to="/admin"><ShieldCheck /> Admin panel</Link></Button>}
          <Button variant="ghost" onClick={() => { store.logout(); nav("/"); }}><LogOut /> Chiqish</Button>
        </div>
      </main>
    </div>
  );
}
