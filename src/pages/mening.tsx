import { useHead } from "@/lib/head";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Phone, CheckCircle2, Clock, Star, Flag } from "lucide-react";
import { AppHeader } from "@/components/mardikor/AppHeader";
import { Stars } from "@/components/mardikor/Stars";
import { ComplaintDialog, ReviewDialog, type Target } from "@/components/mardikor/FeedbackDialogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { txStore, commissionFor, confirmSide, employerIdFor, formatSum, seedPhone, store, takenCount, type Acceptance, type Job, type User } from "@/lib/mardikor";
import { complaintStore, reviewStore } from "@/lib/reviews";

function Status({ a }: { a: Acceptance }) {
  if (a.status === "done") return <Badge className="gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Yakunlandi</Badge>;
  return <Badge variant="secondary" className="gap-1"><Clock className="h-3.5 w-3.5" />Jarayonda</Badge>;
}

/** Rate / complain controls for one side of an accepted job. */
function Feedback({ t, done, onRate, onComplain }: { t: Target; done: boolean; onRate: (t: Target) => void; onComplain: (t: Target) => void }) {
  const mine = reviewStore.mine(t.acceptanceId, t.fromId);
  const open = complaintStore.all().find((c) => c.acceptanceId === t.acceptanceId && c.fromId === t.fromId && c.status === "new");
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3 text-xs">
      {done && (mine
        ? <span className="flex items-center gap-1.5 text-muted-foreground">Sizning bahoyingiz: <Stars value={mine.stars} size={14} /></span>
        : <Button size="sm" variant="secondary" onClick={() => onRate(t)}><Star /> {t.toRole === "worker" ? "Ishchini baholash" : "Ish beruvchini baholash"}</Button>)}
      {!done && <span className="text-muted-foreground">Baholash ish yakunlangach ochiladi.</span>}
      <span className="ml-auto">
        {open
          ? <span className="text-muted-foreground">Shikoyat ko‘rib chiqilmoqda</span>
          : <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onComplain(t)}><Flag /> Shikoyat</Button>}
      </span>
    </div>
  );
}

export default function Mine() {
  useHead("Mening ishlarim — Daywork.uz", "Qabul qilgan ishlaringiz, e’lon qilgan zayavkalaringiz, baholash va shikoyatlar.");
  const [p, setP] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [acc, setAcc] = useState<Acceptance[]>([]);
  const [rate, setRate] = useState<Target | null>(null);
  const [complain, setComplain] = useState<Target | null>(null);
  const [, refresh] = useState(0);
  useEffect(() => { setP(store.profile()); setJobs(store.jobs()); setAcc(store.acceptances()); }, []);

  const confirm = (a: Acceptance, side: "employer" | "worker") => {
    const next = confirmSide(a, side);
    const all = acc.map((x) => (x.id === a.id ? next : x));
    store.saveAcceptances(all); setAcc(all);
    if (next.status === "done") {
      const job = jobs.find((j) => j.id === a.jobId);
      if (side === "worker" && p && job) {
        const np = { ...p, balance: p.balance - commissionFor(job.pay), completed: p.completed + 1 };
        store.saveProfile(np); setP(np);
        txStore.add({ kind: "commission", amount: -commissionFor(job.pay), note: `1% komissiya: ${job.title}` });
      }
      toast.success("Ish ikkala tomondan tasdiqlandi va yakunlandi. Endi bir-biringizni baholashingiz mumkin.");
    } else toast.success("Tasdiqingiz qabul qilindi. Ikkinchi tomon tasdig‘i kutilmoqda.");
  };

  const demoWorker = (job: Job) => {
    if (takenCount(job, acc) >= job.slots) { toast.error("Barcha o‘rinlar band."); return; }
    const n = Math.floor(Math.random() * 900 + 100);
    const all = [...acc, { id: crypto.randomUUID(), jobId: job.id, workerId: "DEMO" + n, workerName: "Demo ishchi " + n, workerPhone: "+998 93 555 0" + n, employerDone: false, workerDone: true, status: "active" as const, at: Date.now() }];
    store.saveAcceptances(all); setAcc(all);
  };

  if (!p) return (
    <div className="min-h-screen"><AppHeader />
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-muted-foreground">Ishlaringizni ko‘rish uchun tizimga kiring.</p>
        <Button asChild className="mt-4"><Link to="/kirish">Kirish</Link></Button>
      </main>
    </div>
  );

  const taken = acc.filter((a) => a.workerId === p.id);
  const posted = jobs.filter((j) => j.employerId === p.id);
  const done = () => { setRate(null); setComplain(null); refresh((n) => n + 1); };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold">Mening ishlarim</h1>
        <p className="mt-1 text-sm text-muted-foreground">Balans: <b>{formatSum(p.balance)}</b> · Yakunlangan ishlar: <b>{p.completed}</b></p>
        <Tabs defaultValue="worker" className="mt-6">
          <TabsList>
            <TabsTrigger value="worker">Qabul qilganlarim ({taken.length})</TabsTrigger>
            <TabsTrigger value="employer">Zayavkalarim ({posted.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="worker" className="mt-4 space-y-3">
            {taken.length === 0 && <p className="py-10 text-center text-muted-foreground">Hali ish qabul qilmagansiz. <Link to="/zayavkalar" className="text-primary underline">Lentaga o‘ting</Link></p>}
            {taken.map((a) => { const j = jobs.find((x) => x.id === a.jobId); if (!j) return null;
              const t: Target = { acceptanceId: a.id, jobId: j.id, jobTitle: j.title, fromId: p.id, fromName: p.name, toId: employerIdFor(j), toName: j.employer, toRole: "employer" };
              return (
              <div key={a.id} className="rounded-2xl border bg-card p-5">
                <div className="flex items-start justify-between gap-3"><h3 className="font-semibold">{j.title}</h3><Status a={a} /></div>
                <p className="mt-1 text-sm text-muted-foreground">{j.district} · {j.date} · {formatSum(j.pay)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-muted p-3 text-sm">
                  <Phone className="h-4 w-4 text-primary" /> Ish beruvchi: <Link to={`/u/${t.toId}`} className="font-bold hover:underline">{j.employer}</Link>
                  <a href={"tel:" + seedPhone(j).replace(/\s/g, "")} className="ml-auto font-semibold text-primary">{seedPhone(j)}</a>
                </div>
                {a.status === "active" && (
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>Siz: {a.workerDone ? "✓ tasdiqladingiz" : "kutilmoqda"} · Ish beruvchi: {a.employerDone ? "✓" : "kutilmoqda"}</span>
                    {!a.workerDone && <Button size="sm" onClick={() => confirm(a, "worker")}>Ish yakunlandi</Button>}
                  </div>
                )}
                {a.status === "done" && <p className="mt-3 text-xs text-muted-foreground">Komissiya (1%): {formatSum(commissionFor(j.pay))} balansdan yechildi.</p>}
                <Feedback t={t} done={a.status === "done"} onRate={setRate} onComplain={setComplain} />
              </div>
            ); })}
          </TabsContent>

          <TabsContent value="employer" className="mt-4 space-y-3">
            {posted.length === 0 && <p className="py-10 text-center text-muted-foreground">Zayavka e’lon qilmagansiz. <Link to="/zayavka-yangi" className="text-primary underline">Yangi zayavka</Link></p>}
            {posted.map((j) => { const list = acc.filter((a) => a.jobId === j.id); return (
              <div key={j.id} className="rounded-2xl border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold">{j.title}</h3>
                  <Badge variant="secondary">{takenCount(j, acc)} / {j.slots} band</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{j.date} · {formatSum(j.pay)} / ishchi</p>
                <div className="mt-3 space-y-2">
                  {list.length === 0 && <p className="text-sm text-muted-foreground">Hali hech kim qabul qilmadi.</p>}
                  {list.map((a) => {
                    const t: Target = { acceptanceId: a.id, jobId: j.id, jobTitle: j.title, fromId: p.id, fromName: p.name, toId: a.workerId, toName: a.workerName, toRole: "worker" };
                    return (
                    <div key={a.id} className="rounded-xl bg-muted p-3 text-sm">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link to={`/u/${a.workerId}`} className="font-bold hover:underline">{a.workerName}</Link>
                        <a href={"tel:" + a.workerPhone.replace(/\s/g, "")} className="text-primary">{a.workerPhone}</a>
                        <span className="ml-auto"><Status a={a} /></span>
                        {a.status === "active" && !a.employerDone && <Button size="sm" onClick={() => confirm(a, "employer")}>Ish yakunlandi</Button>}
                      </div>
                      <Feedback t={t} done={a.status === "done"} onRate={setRate} onComplain={setComplain} />
                    </div>
                  ); })}
                </div>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => demoWorker(j)}>+ Demo ishchi qabul qilsin</Button>
              </div>
            ); })}
          </TabsContent>
        </Tabs>
      </main>
      <ReviewDialog target={rate} onClose={() => setRate(null)} onDone={done} />
      <ComplaintDialog target={complain} onClose={() => setComplain(null)} onDone={done} />
    </div>
  );
}
