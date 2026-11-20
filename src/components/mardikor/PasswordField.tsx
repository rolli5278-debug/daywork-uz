import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MIN_PW, passwordIssues, passwordStrength } from "@/lib/auth";

export function PasswordInput({ value, onChange, placeholder, autoComplete, id }: {
  value: string; onChange: (v: string) => void; placeholder?: string; autoComplete: "current-password" | "new-password"; id?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "••••••••"} autoComplete={autoComplete} maxLength={128} className="pr-10" />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Parolni yashirish" : "Parolni ko‘rsatish"}
        className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

const LEVELS = ["Juda zaif", "Zaif", "O‘rtacha", "Yaxshi", "Kuchli"];
const COLORS = ["bg-destructive", "bg-destructive", "bg-accent", "bg-success", "bg-success"];

/** Strength bar + live checklist of the password rules. */
export function PasswordRules({ value, phone }: { value: string; phone?: string }) {
  const s = passwordStrength(value);
  const issues = passwordIssues(value, phone);
  const rules = [
    { t: `Kamida ${MIN_PW} ta belgi`, ok: value.length >= MIN_PW },
    { t: "Kamida bitta harf", ok: /[A-Za-z]/.test(value) },
    { t: "Kamida bitta raqam", ok: /\d/.test(value) },
  ];
  const extra = issues.filter((i) => !rules.some((r) => r.t === i));
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => <div key={i} className={cn("h-1.5 flex-1 rounded-full", value && i < Math.max(1, s) ? COLORS[s] : "bg-muted")} />)}
      </div>
      {value && <p className="text-xs text-muted-foreground">Parol kuchi: <b>{LEVELS[s]}</b></p>}
      <ul className="space-y-1 text-xs">
        {rules.map((r) => (
          <li key={r.t} className={cn("flex items-center gap-1.5", r.ok ? "text-success" : "text-muted-foreground")}>
            {r.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}{r.t}
          </li>
        ))}
        {extra.map((t) => <li key={t} className="flex items-center gap-1.5 text-destructive"><X className="h-3.5 w-3.5" />{t}</li>)}
      </ul>
    </div>
  );
}
