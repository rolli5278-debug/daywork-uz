import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtAvg } from "@/lib/reviews";

/** Read-only star row (supports fractional averages). */
export function Stars({ value, size = 16, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${fmtAvg(value)} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
          <Star className="absolute inset-0 text-border" style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} />
          <span className="absolute inset-0 overflow-hidden" style={{ width: `${Math.max(0, Math.min(1, value - i + 1)) * 100}%` }}>
            <Star className="text-accent" style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} />
          </span>
        </span>
      ))}
    </span>
  );
}

/** Interactive 1–5 star picker. */
export function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const labels = ["", "Juda yomon", "Yomon", "O‘rtacha", "Yaxshi", "A’lo"];
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1" role="radiogroup" aria-label="Baho">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" role="radio" aria-checked={value === i} aria-label={`${i} yulduz`} onClick={() => onChange(i)}
            className="rounded-md p-0.5 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <Star className={cn("h-8 w-8", i <= value ? "text-accent" : "text-border")} fill="currentColor" strokeWidth={0} />
          </button>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">{labels[value]}</span>
    </div>
  );
}

/** Compact "★ 4,7 (12)" label. */
export function RatingLabel({ avg, count, className }: { avg: number; count: number; className?: string }) {
  if (!count) return <span className={cn("text-xs text-muted-foreground", className)}>Hali baho yo‘q</span>;
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
      <Star className="h-4 w-4 text-accent" fill="currentColor" strokeWidth={0} />
      <b>{fmtAvg(avg)}</b><span className="text-muted-foreground">({count})</span>
    </span>
  );
}
