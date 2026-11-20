import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StarPicker } from "./Stars";
import { COMPLAINT_REASONS, MAX_COMMENT, complaintStore, reviewStore, type RatedRole } from "@/lib/reviews";

/** Who is being rated / complained about, in the context of one accepted job. */
export type Target = {
  acceptanceId: string; jobId: string; jobTitle: string;
  fromId: string; fromName: string; toId: string; toName: string; toRole: RatedRole;
};

export function ReviewDialog({ target, onClose, onDone }: { target: Target | null; onClose: () => void; onDone: () => void }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const submit = () => {
    if (!target) return;
    const err = reviewStore.add({ ...target, stars, comment });
    if (err) { toast.error(err); return; }
    toast.success("Rahmat! Bahoyingiz ommaviy profilda ko‘rsatiladi.");
    setStars(5); setComment(""); onDone();
  };
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      {target && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{target.toRole === "worker" ? "Ishchini baholang" : "Ish beruvchini baholang"}</DialogTitle>
            <DialogDescription>{target.toName} · {target.jobTitle}</DialogDescription>
          </DialogHeader>
          <StarPicker value={stars} onChange={setStars} />
          <div className="space-y-1.5">
            <Label htmlFor="rv-comment">Izoh (ixtiyoriy)</Label>
            <Textarea id="rv-comment" value={comment} maxLength={MAX_COMMENT} onChange={(e) => setComment(e.target.value)}
              placeholder={target.toRole === "worker" ? "Ish sifati, vaqtida kelgani…" : "To‘lov, muomala, shartlar…"} />
            <p className="text-right text-xs text-muted-foreground">{comment.length} / {MAX_COMMENT}</p>
          </div>
          <p className="text-xs text-muted-foreground">Baho va izoh hamma ko‘radigan ommaviy profilda chiqadi. Haqoratli izohlarni administrator yashiradi.</p>
          <Button size="lg" onClick={submit}>Bahoni yuborish</Button>
        </DialogContent>
      )}
    </Dialog>
  );
}

export function ComplaintDialog({ target, onClose, onDone }: { target: Target | null; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState("");
  const [text, setText] = useState("");
  const submit = () => {
    if (!target) return;
    const err = complaintStore.add({
      acceptanceId: target.acceptanceId, jobId: target.jobId, jobTitle: target.jobTitle,
      fromId: target.fromId, fromName: target.fromName, againstId: target.toId, againstName: target.toName, reason, text,
    });
    if (err) { toast.error(err); return; }
    toast.success("Shikoyat yuborildi. Administrator ko‘rib chiqadi.");
    setReason(""); setText(""); onDone();
  };
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      {target && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shikoyat qoldirish</DialogTitle>
            <DialogDescription>{target.toName} · {target.jobTitle}</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5"><Label>Sabab</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
              <SelectContent>{COMPLAINT_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cp-text">Nima bo‘ldi?</Label>
            <Textarea id="cp-text" value={text} maxLength={MAX_COMMENT} onChange={(e) => setText(e.target.value)} placeholder="Vaziyatni batafsil yozing" />
            <p className="text-right text-xs text-muted-foreground">{text.length} / {MAX_COMMENT}</p>
          </div>
          <p className="text-xs text-muted-foreground">Shikoyat ochiq ko‘rsatilmaydi — uni faqat administratorlar ko‘radi. Tasdiqlangan shikoyatlar soni foydalanuvchi profilida chiqadi.</p>
          <Button size="lg" variant="destructive" disabled={!reason || text.trim().length < 10} onClick={submit}>Shikoyatni yuborish</Button>
        </DialogContent>
      )}
    </Dialog>
  );
}
