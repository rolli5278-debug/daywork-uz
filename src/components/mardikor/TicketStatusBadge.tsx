import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, type TicketStatus } from "@/lib/support";

const CLS: Record<TicketStatus, string> = {
  open: "bg-accent text-accent-foreground hover:bg-accent",
  answered: "bg-success text-white hover:bg-success",
  closed: "",
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge variant={status === "closed" ? "secondary" : "default"} className={CLS[status]}>{STATUS_LABEL[status]}</Badge>;
}
