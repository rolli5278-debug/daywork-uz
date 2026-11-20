import { useHead } from "@/lib/head";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/mardikor/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JOB_TYPES, MAX_ACTIVE_JOBS, store, type Profile } from "@/lib/mardikor";


export default function NewJob() {
  useHead("Yangi zayavka — Daywork.uz", "Ish turi, to‘lov va kerakli ishchilar sonini kiritib zayavka qoldiring.");
  const nav = useNavigate();
  const [p, setP] = useState<Profile | null>(null);
  const [f, setF] = useState({ type: "", title: "", description: "", pay: "", date: "", slots: "1" });
  useEffect(() => { const x = store.profile(); if (!x) nav("/kirish"); else setP(x); }, [nav]);
  if (!p) return null;
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const valid = f.type && f.title.trim() && Number(f.pay) > 0 && f.date && Number(f.slots) >= 1;

  const submit = () => {
    if (store.myActiveCount() >= MAX_ACTIVE_JOBS) { toast.error(`Bir vaqtda ${MAX_ACTIVE_JOBS} tadan ortiq faol zayavka bo‘lmaydi.`); return; }
    store.addJob({ id: crypto.randomUUID(), type: f.type, title: f.title, description: f.description, pay: Number(f.pay), date: f.date,
      region: p.region, district: p.district, slots: Number(f.slots), taken: 0, employer: p.name, employerId: p.id, employerPhone: p.phone, createdAt: Date.now() });
    toast.success("Zayavka e’lon qilindi");
    nav("/mening");
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-3xl font-bold">Yangi zayavka</h1>
        <p className="mt-1 text-muted-foreground">{p.district}, {p.region}</p>
        <div className="mt-6 space-y-4 rounded-3xl border bg-card p-6">
          <div className="space-y-1.5"><Label>Ish turi</Label>
            <Select value={f.type} onValueChange={(v) => setF({ ...f, type: v })}>
              <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
              <SelectContent>{JOB_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Sarlavha</Label><Input value={f.title} onChange={set("title")} placeholder="Masalan: yuk tushirishga 2 kishi" /></div>
          <div className="space-y-1.5"><Label>Tavsif</Label><Textarea value={f.description} onChange={set("description")} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>To‘lov (1 ishchi, so‘m)</Label><Input inputMode="numeric" value={f.pay} onChange={(e) => setF({ ...f, pay: e.target.value.replace(/\D/g, "") })} /></div>
            <div className="space-y-1.5"><Label>Nechta ishchi kerak?</Label><Input type="number" min={1} value={f.slots} onChange={set("slots")} /></div>
          </div>
          <div className="space-y-1.5"><Label>Ish sanasi</Label><Input type="date" value={f.date} onChange={set("date")} /></div>
          <Button className="w-full" size="lg" disabled={!valid} onClick={submit}>E’lon qilish</Button>
        </div>
      </main>
    </div>
  );
}
