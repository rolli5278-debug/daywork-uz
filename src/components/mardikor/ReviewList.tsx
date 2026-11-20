import { Link } from "react-router-dom";
import { Stars } from "./Stars";
import type { Review } from "@/lib/reviews";

export const fmtDate = (t: number) => new Date(t).toLocaleDateString("ru-RU");

/** Public list of reviews. `showTarget` adds "→ who was rated" (for the global feed). */
export function ReviewList({ items, showTarget, empty = "Hozircha izohlar yo‘q." }: { items: Review[]; showTarget?: boolean; empty?: string }) {
  if (!items.length) return <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>;
  return (
    <ul className="space-y-3">
      {items.map((r) => (
        <li key={r.id} className="rounded-2xl border bg-card p-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <Stars value={r.stars} size={14} />
            <b>{r.fromName}</b>
            {showTarget && <>→ <Link to={`/u/${r.toId}`} className="font-semibold text-primary hover:underline">{r.toName}</Link></>}
            <span className="ml-auto text-xs text-muted-foreground">{fmtDate(r.at)}</span>
          </div>
          {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
          <p className="mt-1 text-xs text-muted-foreground">{r.toRole === "worker" ? "Ishchi sifatida" : "Ish beruvchi sifatida"} · {r.jobTitle}</p>
        </li>
      ))}
    </ul>
  );
}
