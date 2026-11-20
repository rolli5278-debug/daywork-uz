import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, BookOpen, EyeOff, Link2, Pencil, Plus, Share2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FAQ_CATEGORIES, faq, faqLink, type Faq } from "@/lib/support";
import type { User } from "@/lib/mardikor";

type Draft = { id?: string; category: string; question: string; answer: string };
const EMPTY: Draft = { category: "", question: "", answer: "" };

/** Admin-only FAQ editor shown on the admin's profile page. */
export function FaqManager({ admin, prefill }: { admin: User; prefill?: { question: string; answer: string } }) {
  const [list, setList] = useState<Faq[]>(() => faq.all());
  const [edit, setEdit] = useState<Draft | null>(null);
  const [del, setDel] = useState<Faq | null>(null);
  const [filter, setFilter] = useState<"all" | "draft" | "published" | "mine">("all");
  const reload = () => setList(faq.all());

  // Opened from a support ticket ("FAQ’ga aylantirish"): start a new draft from it.
  useEffect(() => { if (prefill) setEdit({ ...EMPTY, category: "Umumiy", ...prefill }); }, [prefill]);

  const save = (andPublish: boolean) => {
    if (!edit) return;
    const r = faq.upsert(admin, edit);
    if (!r.ok) { toast.error(r.error); return; }
    if (andPublish) faq.setStatus(admin, r.value.id, "published");
    toast.success(andPublish ? "Saqlandi va tizimga ulashildi" : edit.id ? "O‘zgarishlar saqlandi" : "Qoralama saqlandi");
    setEdit(null); reload();
  };
  const share = (f: Faq) => {
    faq.setStatus(admin, f.id, f.status === "published" ? "draft" : "published");
    toast.success(f.status === "published" ? "Ommaviy sahifadan olindi (qoralama)" : "Tizimga ulashildi — Yordam markazida ko‘rinadi");
    reload();
  };
  const copy = (f: Faq) => navigator.clipboard?.writeText(faqLink(f.id)).then(() => toast.success("Havola nusxalandi"), () => toast.error("Nusxalab bo‘lmadi"));

  const shown = list.filter((f) => filter === "all" || (filter === "mine" ? f.authorId === admin.id : f.status === filter));
  const counts = { all: list.length, published: list.filter((f) => f.status === "published").length, draft: list.filter((f) => f.status === "draft").length, mine: list.filter((f) => f.authorId === admin.id).length };

  return (
    <section id="faq" className="rounded-2xl border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold"><BookOpen className="h-5 w-5 text-primary" />FAQ boshqaruvi</h2>
          <p className="mt-1 text-sm text-muted-foreground">Savol-javob yarating, so‘ng “Tizimga ulashish” bilan <Link to="/yordam" className="text-primary hover:underline">Yordam markazi</Link>da e’lon qiling.</p>
        </div>
        <Button onClick={() => setEdit({ ...EMPTY })}><Plus /> Yangi savol</Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {([["all", "Barchasi"], ["published", "Ulashilgan"], ["draft", "Qoralama"], ["mine", "Meniki"]] as const).map(([k, t]) => (
          <Button key={k} size="sm" variant={filter === k ? "default" : "secondary"} onClick={() => setFilter(k)}>{t} ({counts[k]})</Button>
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {shown.map((f) => (
          <li key={f.id} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {f.status === "published" ? <Badge className="bg-success text-white hover:bg-success">Ulashilgan</Badge> : <Badge variant="secondary">Qoralama</Badge>}
                  <span className="text-xs text-muted-foreground">{f.category} · {f.authorName}</span>
                </div>
                <p className="mt-2 font-semibold">{f.question}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{f.answer}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <Button size="sm" variant="ghost" title="Yuqoriga" aria-label="Yuqoriga" onClick={() => { faq.move(admin, f.id, -1); reload(); }}><ArrowUp /></Button>
                <Button size="sm" variant="ghost" title="Pastga" aria-label="Pastga" onClick={() => { faq.move(admin, f.id, 1); reload(); }}><ArrowDown /></Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1 border-t pt-3">
              <Button size="sm" variant={f.status === "published" ? "ghost" : "default"} onClick={() => share(f)}>
                {f.status === "published" ? <><EyeOff /> Ulashishni bekor qilish</> : <><Share2 /> Tizimga ulashish</>}
              </Button>
              {f.status === "published" && <Button size="sm" variant="ghost" onClick={() => copy(f)}><Link2 /> Havola</Button>}
              <Button size="sm" variant="ghost" onClick={() => setEdit({ id: f.id, category: f.category, question: f.question, answer: f.answer })}><Pencil /> Tahrirlash</Button>
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDel(f)}><Trash2 /> O‘chirish</Button>
            </div>
          </li>
        ))}
        {shown.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Bu bo‘limda savollar yo‘q.</p>}
      </ul>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        {edit && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{edit.id ? "Savolni tahrirlash" : "Yangi savol"}</DialogTitle>
              <DialogDescription>Yangi savol avval qoralama sifatida saqlanadi. Ommaga ko‘rsatish uchun “Tizimga ulashish”ni bosing.</DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5"><Label>Bo‘lim</Label>
              <Select value={edit.category} onValueChange={(v) => setEdit({ ...edit, category: v })}>
                <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                <SelectContent>{FAQ_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label htmlFor="fq-q">Savol</Label><Input id="fq-q" maxLength={200} value={edit.question} onChange={(e) => setEdit({ ...edit, question: e.target.value })} placeholder="Masalan: Zayavkani qanday bekor qilaman?" /></div>
            <div className="space-y-1.5">
              <Label htmlFor="fq-a">Javob</Label>
              <Textarea id="fq-a" rows={6} maxLength={2000} value={edit.answer} onChange={(e) => setEdit({ ...edit, answer: e.target.value })} />
              <p className="text-right text-xs text-muted-foreground">{edit.answer.length} / 2000</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="secondary" onClick={() => save(false)}>{edit.id ? "Saqlash" : "Qoralama saqlash"}</Button>
              <Button onClick={() => save(true)}><Share2 /> Saqlash va ulashish</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        {del && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Savolni o‘chirasizmi?</DialogTitle>
              <DialogDescription>“{del.question}” butunlay o‘chiriladi. Buni qaytarib bo‘lmaydi.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setDel(null)}>Bekor qilish</Button>
              <Button variant="destructive" onClick={() => { faq.remove(admin, del.id); setDel(null); reload(); toast.success("O‘chirildi"); }}>O‘chirish</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
