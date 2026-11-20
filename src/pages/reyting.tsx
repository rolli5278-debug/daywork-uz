import { useHead } from "@/lib/head";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { Trophy } from "lucide-react";
import { AppHeader } from "@/components/mardikor/AppHeader";
import { RatingLabel, Stars } from "@/components/mardikor/Stars";
import { ReviewList } from "@/components/mardikor/ReviewList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { leaderboard, reviewStore, type RankRow } from "@/lib/reviews";

function Board({ rows, empty }: { rows: RankRow[]; empty: string }) {
  if (!rows.length) return <p className="py-10 text-center text-muted-foreground">{empty}</p>;
  return (
    <ol className="divide-y rounded-2xl border bg-card">
      {rows.map((r, i) => (
        <li key={r.id}>
          <Link to={`/u/${r.id}`} className="flex items-center gap-4 p-4 transition hover:bg-muted/50">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm font-bold ${i < 3 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{r.name}</div>
              <Stars value={r.avg} size={14} />
            </div>
            <RatingLabel avg={r.avg} count={r.count} />
          </Link>
        </li>
      ))}
    </ol>
  );
}

export default function Reyting() {
  useHead("Ommaviy reyting — Daywork.uz", "Ishchilar va ish beruvchilarning ochiq reytingi va izohlari.");
  const workers = useMemo(() => leaderboard("worker"), []);
  const employers = useMemo(() => leaderboard("employer"), []);
  const latest = useMemo(() => reviewStore.publicAll().sort((a, b) => b.at - a.at).slice(0, 10), []);
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"><Trophy className="h-3.5 w-3.5" />Ochiq reyting</span>
        <h1 className="mt-4 text-3xl font-bold">Reyting va izohlar</h1>
        <p className="mt-1 max-w-xl text-muted-foreground">Baholar faqat ikkala tomon tasdiqlagan, yakunlangan ishlardan keyin qoldiriladi.</p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <Tabs defaultValue="employer">
            <TabsList>
              <TabsTrigger value="employer">Ish beruvchilar ({employers.length})</TabsTrigger>
              <TabsTrigger value="worker">Ishchilar ({workers.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="employer" className="mt-4"><Board rows={employers} empty="Hali baholangan ish beruvchi yo‘q." /></TabsContent>
            <TabsContent value="worker" className="mt-4"><Board rows={workers} empty="Hali baholangan ishchi yo‘q." /></TabsContent>
          </Tabs>
          <section>
            <h2 className="text-lg font-semibold">So‘nggi izohlar</h2>
            <div className="mt-4"><ReviewList items={latest} showTarget /></div>
          </section>
        </div>
      </main>
    </div>
  );
}
