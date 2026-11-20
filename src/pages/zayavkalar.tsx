import { useHead } from "@/lib/head";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/mardikor/AppHeader";
import { JobCard } from "@/components/mardikor/JobCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { REGIONS, SEED_JOBS, isBalanceBlocked, acceptError, commissionFor, employerIdFor, formatSum, store, takenCount, type Job } from "@/lib/mardikor";
import { statsFor } from "@/lib/reviews";
import { RatingLabel } from "@/components/mardikor/Stars";
import { Link } from "react-router-dom";


export default function Feed() {
  useHead("Zayavkalar lentasi — Daywork.uz", "Tumaningizdagi faol kunlik ish zayavkalari: to‘lov, sana va bo‘sh o‘rinlar.");
  const [jobs, setJobs] = useState<Job[]>(SEED_JOBS);
  const [district, setDistrict] = useState("all");
  const [sort, setSort] = useState<"new" | "pay">("new");
  const [region, setRegion] = useState<string | null>(null);
  const [open, setOpen] = useState<Job | null>(null);
  const nav = useNavigate();
  useEffect(() => {
    const acc = store.acceptances();
    setJobs(store.jobs().map((j) => ({ ...j, taken: takenCount(j, acc) })));
    const p = store.profile();
    if (p) { setDistrict(p.district); setRegion(p.region); }
  }, []);

  const districts = useMemo(() => (region && REGIONS[region]) ? REGIONS[region] : [...new Set(jobs.map((j) => j.district))].sort((a, b) => a.localeCompare(b)), [jobs, region]);
  const list = useMemo(() => jobs
    .filter((j) => j.taken < j.slots && (!region || j.region === region) && (district === "all" || j.district === district))
    .sort((a, b) => (sort === "pay" ? b.pay - a.pay : b.createdAt - a.createdAt)), [jobs, district, sort]);

  const accept = () => {
    const p = store.profile();
    if (!p || !open) { toast.error("Qabul qilish uchun avval ro‘yxatdan o‘ting."); return; }
    const acc = store.acceptances();
    const base = store.jobs().find((j) => j.id === open.id)!;
    if (isBalanceBlocked(p)) { toast.error("Balansingiz manfiy. Avval balansni to‘ldiring."); return; }
    const err = acceptError(base, acc, p.id);
    if (err) { toast.error(err); return; }
    store.saveAcceptances([...acc, { id: crypto.randomUUID(), jobId: open.id, workerId: p.id, workerName: p.name, workerPhone: p.phone, employerDone: false, workerDone: false, status: "active", at: Date.now() }]);
    toast.success("O‘rin sizga biriktirildi. Ish beruvchi kontakti ochildi.");
    setOpen(null);
    nav("/mening");
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Zayavkalar</h1>
            <p className="mt-1 text-muted-foreground">{list.length} ta faol zayavka</p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{region ? `${region}: barcha tumanlar` : "Barcha tumanlar"}</SelectItem>
                {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as "new" | "pay")}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Eng yangisi</SelectItem>
                <SelectItem value="pay">Narx bo‘yicha</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((j) => <JobCard key={j.id} job={j} onOpen={() => setOpen(j)} />)}
        </div>
        {list.length === 0 && <p className="mt-12 text-center text-muted-foreground">Bu tumanda hozircha zayavka yo‘q.</p>}
      </main>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        {open && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{open.title}</DialogTitle>
              <DialogDescription>{open.type} · {open.district}, {open.region}</DialogDescription>
            </DialogHeader>
            <p className="text-sm">{open.description}</p>
            <Link to={`/u/${employerIdFor(open)}`} className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm transition hover:border-primary">
              <span>Ish beruvchi: <b>{open.employer}</b></span>
              <RatingLabel avg={statsFor(employerIdFor(open)).avg} count={statsFor(employerIdFor(open)).count} />
            </Link>
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted p-4 text-sm">
              <div>To‘lov (1 ishchi): <b>{formatSum(open.pay)}</b></div>
              <div>Sana: <b>{open.date}</b></div>
              <div>O‘rinlar: <b>{open.taken} / {open.slots} band</b></div>
              <div>Komissiya (1%): <b>{formatSum(commissionFor(open.pay))}</b></div>
            </div>
            <p className="text-xs text-muted-foreground">Telefon raqam va to‘liq manzil qabul qilgandan keyin ochiladi. Qabul qilish yakuniy.</p>
            <Button size="lg" onClick={accept}>Qabul qilish</Button>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
