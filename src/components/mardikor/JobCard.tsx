import { MapPin, CalendarDays, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatSum, type Job } from "@/lib/mardikor";

export function JobCard({ job, onOpen }: { job: Job; onOpen?: () => void }) {
  const left = job.slots - job.taken;
  return (
    <button onClick={onOpen} className="group w-full rounded-2xl border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <Badge variant="secondary">{job.type}</Badge>
        {job.taken > 0 && <Badge className="bg-accent text-accent-foreground hover:bg-accent">Qisman band</Badge>}
      </div>
      <h3 className="mt-3 text-base font-semibold leading-snug">{job.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.district}</span>
        <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{job.date}</span>
        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{job.taken} / {job.slots} o‘rin band · {left} bo‘sh</span>
      </div>
      <div className="mt-4 font-display text-xl font-bold text-primary">{formatSum(job.pay)}</div>
    </button>
  );
}
