import { useHead } from "@/lib/head";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/mardikor/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REFERRAL_BONUS, TOPUP_AMOUNTS, formatSum, isBalanceBlocked, referralError, store, txStore, type Profile, type Tx } from "@/lib/mardikor";


export default function Balance() {
  useHead("Balans va referal — Daywork.uz", "Balansingiz, komissiya tarixi, balansni to‘ldirish va referal bonusi.");
  const [p, setP] = useState<Profile | null>(null);
  const [tx, setTx] = useState<Tx[]>([]);
  const [code, setCode] = useState("");
  const [used, setUsed] = useState(false);
  useEffect(() => { setP(store.profile()); setTx(txStore.list()); setUsed(txStore.usedReferral()); }, []);

  if (!p) return (<div className="min-h-screen"><AppHeader /><main className="mx-auto max-w-md px-4 py-16 text-center"><p>Balansni ko‘rish uchun kiring.</p><Button asChild className="mt-4"><Link to="/kirish">Kirish</Link></Button></main></div>);

  const credit = (amount: number, kind: Tx["kind"], note: string) => {
    const np = { ...p, balance: p.balance + amount };
    store.saveProfile(np); setP(np); txStore.add({ kind, amount, note }); setTx(txStore.list());
  };
  const topup = (a: number) => { credit(a, "topup", "Balans to‘ldirildi (demo, Click/Payme keyin ulanadi)"); toast.success(`${formatSum(a)} qo‘shildi`); };
  const applyRef = () => {
    const c = code.trim().toUpperCase();
    const err = referralError(c, p.id, used);
    if (err) { toast.error(err); return; }
    txStore.markReferral(); setUsed(true);
    credit(REFERRAL_BONUS, "referral", `Referal bonus (${c})`);
    toast.success(`${formatSum(REFERRAL_BONUS)} bonus qo‘shildi`);
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <section className="rounded-2xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">ID: <b>{p.id}</b></p>
          <p className="mt-2 text-4xl font-bold">{formatSum(p.balance)}</p>
          {isBalanceBlocked(p) && <p className="mt-2 text-sm text-destructive">Balans manfiy — to‘ldirmaguningizcha yangi ish qabul qila olmaysiz.</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            {TOPUP_AMOUNTS.map((a) => <Button key={a} variant="secondary" onClick={() => topup(a)}>+ {formatSum(a)}</Button>)}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Demo: pul haqiqatda yechilmaydi. Click/Payme keyingi bosqichda ulanadi.</p>
        </section>
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Referal</h2>
          <p className="mt-1 text-sm text-muted-foreground">Do‘stingizga kodingizni bering: <b>{p.id}</b>. Do‘stingiz kodini kiritsangiz, {formatSum(REFERRAL_BONUS)} bonus olasiz.</p>
          <div className="mt-3 flex gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="MK123456" disabled={used} />
            <Button onClick={applyRef} disabled={used}>{used ? "Ishlatilgan" : "Qo‘llash"}</Button>
          </div>
        </section>
        <section className="rounded-2xl border bg-card p-6">
          <h2 className="text-lg font-semibold">Tarix</h2>
          {tx.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Hozircha amallar yo‘q.</p> : (
            <ul className="mt-3 divide-y">
              {tx.map((t) => (
                <li key={t.id} className="flex justify-between py-2 text-sm">
                  <span>{t.note}<br /><span className="text-xs text-muted-foreground">{new Date(t.at).toLocaleString("ru-RU")}</span></span>
                  <b className={t.amount < 0 ? "text-destructive" : "text-primary"}>{t.amount > 0 ? "+" : ""}{formatSum(t.amount)}</b>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
