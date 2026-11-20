import { useHead } from "@/lib/head";
import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { AlertTriangle, BadgeCheck, Briefcase, HardHat, ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/mardikor/AppHeader";
import { RatingLabel, Stars } from "@/components/mardikor/Stars";
import { ReviewList } from "@/components/mardikor/ReviewList";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEED_JOBS, TRUSTED_THRESHOLD, employerIdFor, store, users } from "@/lib/mardikor";
import { fmtAvg, reviewStore, statsFor } from "@/lib/reviews";

/** Public profile: rating, reviews, trust badge. Never shows phone numbers. */
export default function PublicProfile() {
  const { id = "" } = useParams();
  const u = users.byId(id);
  const reviews = useMemo(() => reviewStore.publicAll().filter((r) => r.toId === id).sort((a, b) => b.at - a.at), [id]);
  const seedEmployer = SEED_JOBS.find((j) => employerIdFor(j) === id)?.employer;
  const name = u?.name ?? seedEmployer ?? reviews[0]?.toName ?? store.acceptances().find((a) => a.workerId === id)?.workerName;
  useHead(`${name ?? "Foydalanuvchi"} — Daywork.uz`, "Ommaviy profil: reyting va izohlar.");
  const s = statsFor(id);

  if (!name || u?.blocked) return (
    <div className="min-h-screen"><AppHeader />
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Profil topilmadi</h1>
        <p className="mt-2 text-muted-foreground">Bunday foydalanuvchi yo‘q yoki profil yopilgan.</p>
        <Link to="/reyting" className="mt-4 inline-block text-primary underline">Reytingga qaytish</Link>
      </main>
    </div>
  );

  const trusted = (u?.completed ?? 0) >= TRUSTED_THRESHOLD;
  const asWorker = reviews.filter((r) => r.toRole === "worker");
  const asEmployer = reviews.filter((r) => r.toRole === "employer");

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <section className="rounded-3xl border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary font-display text-2xl font-bold text-primary-foreground">{name[0]}</div>
              <div>
                <h1 className="text-2xl font-bold">{name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>ID: {id}</span>
                  {u && <span>· {u.district}, {u.region}</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {u?.role === "admin" && <Badge className="gap-1"><ShieldCheck className="h-3.5 w-3.5" />{u.adminTitle ?? "Administrator"}</Badge>}
                  {trusted && <Badge className="gap-1 bg-success text-white hover:bg-success"><BadgeCheck className="h-3.5 w-3.5" />Ishonchli</Badge>}
                  {!u && <Badge variant="secondary">Demo profil</Badge>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-4xl font-bold">{s.count ? fmtAvg(s.avg) : "—"}</div>
              <Stars value={s.avg} />
              <div className="text-xs text-muted-foreground">{s.count} ta baho</div>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-muted p-3 text-sm"><HardHat className="mb-1 h-4 w-4 text-primary" />Ishchi sifatida<br /><RatingLabel avg={s.asWorker.avg} count={s.asWorker.count} /></div>
            <div className="rounded-xl bg-muted p-3 text-sm"><Briefcase className="mb-1 h-4 w-4 text-primary" />Ish beruvchi sifatida<br /><RatingLabel avg={s.asEmployer.avg} count={s.asEmployer.count} /></div>
            <div className="rounded-xl bg-muted p-3 text-sm">
              <AlertTriangle className={`mb-1 h-4 w-4 ${s.confirmedComplaints ? "text-destructive" : "text-primary"}`} />Tasdiqlangan shikoyatlar<br />
              <b className={s.confirmedComplaints ? "text-destructive" : ""}>{s.confirmedComplaints}</b>
            </div>
          </div>
          {u && <p className="mt-4 text-sm text-muted-foreground">Yakunlangan ishlar: <b className="text-foreground">{u.completed}</b>{!trusted && ` · “Ishonchli” belgisi ${TRUSTED_THRESHOLD} ta ishdan keyin`}</p>}
        </section>

        <Tabs defaultValue={asEmployer.length > asWorker.length ? "employer" : "worker"} className="mt-8">
          <TabsList>
            <TabsTrigger value="worker">Ishchi sifatida ({asWorker.length})</TabsTrigger>
            <TabsTrigger value="employer">Ish beruvchi sifatida ({asEmployer.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="worker" className="mt-4"><ReviewList items={asWorker} /></TabsContent>
          <TabsContent value="employer" className="mt-4"><ReviewList items={asEmployer} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
