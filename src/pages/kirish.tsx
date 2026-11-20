import { useHead } from "@/lib/head";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { AppHeader } from "@/components/mardikor/AppHeader";
import { PasswordInput, PasswordRules } from "@/components/mardikor/PasswordField";
import { TelegramButton } from "@/components/mardikor/TelegramButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEMO_SMS_CODE, REGIONS, isAllowedAge, isValidUzPhone } from "@/lib/mardikor";
import { login, passwordIssues, phoneTaken, register, resetPassword } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Mode = "login" | "register" | "reset";
type Step = "phone" | "code" | "age" | "profile" | "password";
const REG_STEPS: Step[] = ["phone", "code", "age", "profile", "password"];
const RESET_STEPS: Step[] = ["phone", "code", "password"];

function PhoneInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex">
      <span className="flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm">+998</span>
      <Input className="rounded-l-none" inputMode="numeric" autoComplete="tel-national" placeholder="90 123 45 67" value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 9))} />
    </div>
  );
}

export default function Kirish() {
  useHead("Kirish va ro‘yxatdan o‘tish — Daywork.uz", "Telefon raqam va parol orqali Daywork.uz ga kiring.");
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<Step>("phone");
  const [busy, setBusy] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [code, setCode] = useState("");
  const [tries, setTries] = useState(0);
  const [wait, setWait] = useState(0);
  const [birth, setBirth] = useState("");
  const [ageOk, setAgeOk] = useState(false);
  const [terms, setTerms] = useState(false);
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const switchMode = (m: Mode) => { setMode(m); setStep("phone"); setPassword(""); setPassword2(""); setCode(""); setTries(0); };

  const afterLogin = (u: { name: string; id: string; mustChangePw?: boolean; role: string }) => {
    if (u.mustChangePw) { toast.warning("Xavfsizlik uchun vaqtinchalik parolni o‘zgartiring."); nav("/profil"); return; }
    toast.success(`Xush kelibsiz, ${u.name.split(" ")[0]}!`);
    nav(u.role === "admin" ? "/admin" : "/rol");
  };

  const doLogin = async () => {
    setBusy(true);
    const r = await login(phone, password);
    setBusy(false);
    if (!r.ok) { toast.error(r.error); setPassword(""); return; }
    afterLogin(r.user);
  };

  const sendCode = () => {
    if (mode === "register" && phoneTaken(phone)) { toast.error("Bu raqam allaqachon ro‘yxatdan o‘tgan. Kirish bo‘limidan foydalaning."); return; }
    if (mode === "reset" && !phoneTaken(phone)) { toast.error("Bu raqam ro‘yxatdan o‘tmagan."); return; }
    setStep("code"); setWait(60); toast(`Demo: SMS kod — ${DEMO_SMS_CODE}`);
  };
  const checkCode = () => {
    if (code === DEMO_SMS_CODE) { setStep(mode === "reset" ? "password" : "age"); return; }
    const n = tries + 1; setTries(n); setCode("");
    toast.error(n >= 3 ? "3 marta xato. 15 daqiqaga bloklandi." : `Kod xato. Qolgan urinish: ${3 - n}`);
  };
  const checkAge = () => {
    if (!isAllowedAge(new Date(birth))) { toast.error("Platformadan faqat 18–40 yoshdagilar foydalana oladi."); return; }
    setStep("profile");
  };
  const pwValid = passwordIssues(password, phone).length === 0 && password === password2;

  const finishRegister = async () => {
    setBusy(true);
    const r = await register({ digits: phone, name, region, district, password });
    setBusy(false);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success(`Xush kelibsiz! Sizning ID: ${r.user.id}`);
    nav("/rol");
  };
  const finishReset = async () => {
    setBusy(true);
    const r = await resetPassword(phone, password);
    setBusy(false);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("Parol yangilandi. Endi yangi parol bilan kiring.");
    switchMode("login");
  };

  const steps = mode === "reset" ? RESET_STEPS : REG_STEPS;
  const idx = steps.indexOf(step);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-md px-4 py-12">
        {mode !== "reset" && (
          <div className="mb-6 grid grid-cols-2 rounded-full bg-muted p-1 text-sm font-medium">
            {(["login", "register"] as const).map((m) => (
              <button key={m} onClick={() => switchMode(m)} className={cn("rounded-full py-2 transition", mode === m ? "bg-card shadow-sm" : "text-muted-foreground")}>
                {m === "login" ? "Kirish" : "Ro‘yxatdan o‘tish"}
              </button>
            ))}
          </div>
        )}
        {mode !== "login" && (
          <div className="mb-8 flex gap-2">
            {steps.map((s, i) => <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-primary" : "bg-muted"}`} />)}
          </div>
        )}
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          {mode === "login" && (
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); doLogin(); }}>
              <h1 className="text-2xl font-bold">Hisobga kirish</h1>
              <div className="space-y-1.5"><Label>Telefon raqam</Label><PhoneInput value={phone} onChange={setPhone} /></div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pw">Parol</Label>
                  <button type="button" onClick={() => switchMode("reset")} className="text-xs text-primary hover:underline">Parolni unutdingizmi?</button>
                </div>
                <PasswordInput id="pw" value={password} onChange={setPassword} autoComplete="current-password" />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={!isValidUzPhone(phone) || !password || busy}>
                {busy ? <Loader2 className="animate-spin" /> : <Lock />} Kirish
              </Button>
            </form>
          )}

          {mode !== "login" && step === "phone" && (
            <div className="space-y-5">
              <h1 className="text-2xl font-bold">{mode === "reset" ? "Parolni tiklash" : "Telefon raqamingiz"}</h1>
              {mode === "reset" && <p className="text-sm text-muted-foreground">Ro‘yxatdan o‘tgan raqamingizga tasdiqlash kodi yuboramiz.</p>}
              <PhoneInput value={phone} onChange={setPhone} />
              <Button className="w-full" size="lg" disabled={!isValidUzPhone(phone)} onClick={sendCode}>Kod yuborish</Button>
              {mode === "reset" && <Button variant="ghost" className="w-full" onClick={() => switchMode("login")}>Kirishga qaytish</Button>}
            </div>
          )}
          {step === "code" && (
            <div className="space-y-5">
              <h1 className="text-2xl font-bold">SMS kodni kiriting</h1>
              <p className="text-sm text-muted-foreground">+998 {phone} raqamiga 4 xonali kod yuborildi. Kod 5 daqiqa amal qiladi.</p>
              <InputOTP maxLength={4} value={code} onChange={setCode} disabled={tries >= 3}>
                <InputOTPGroup>{[0, 1, 2, 3].map((i) => <InputOTPSlot key={i} index={i} className="h-14 w-14 text-xl" />)}</InputOTPGroup>
              </InputOTP>
              <Button className="w-full" size="lg" disabled={code.length < 4 || tries >= 3} onClick={checkCode}>Tasdiqlash</Button>
              <Button variant="ghost" className="w-full" disabled={wait > 0} onClick={sendCode}>
                {wait > 0 ? `Qayta yuborish (${wait} s)` : "Kodni qayta yuborish"}
              </Button>
            </div>
          )}
          {step === "age" && (
            <div className="space-y-5">
              <h1 className="text-2xl font-bold">Tug‘ilgan sanangiz</h1>
              <Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
              <label className="flex items-start gap-3 text-sm"><Checkbox checked={ageOk} onCheckedChange={(v) => setAgeOk(!!v)} />Yoshim 18 dan 40 gacha ekanini tasdiqlayman</label>
              <label className="flex items-start gap-3 text-sm"><Checkbox checked={terms} onCheckedChange={(v) => setTerms(!!v)} />Foydalanish shartlariga roziman</label>
              <Button className="w-full" size="lg" disabled={!birth || !ageOk || !terms} onClick={checkAge}>Davom etish</Button>
            </div>
          )}
          {step === "profile" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Profil</h1>
              <div className="space-y-1.5"><Label>Ism-familiya</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aziz Karimov" maxLength={60} /></div>
              <div className="space-y-1.5"><Label>Viloyat</Label>
                <Select value={region} onValueChange={(v) => { setRegion(v); setDistrict(""); }}>
                  <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent>{Object.keys(REGIONS).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Tuman</Label>
                <Select value={district} onValueChange={setDistrict} disabled={!region}>
                  <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent>{(REGIONS[region] ?? []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="w-full" size="lg" disabled={name.trim().length < 3 || !district} onClick={() => setStep("password")}>Davom etish</Button>
            </div>
          )}
          {step === "password" && (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (pwValid) (mode === "reset" ? finishReset() : finishRegister()); }}>
              <h1 className="text-2xl font-bold">{mode === "reset" ? "Yangi parol" : "Parol o‘rnating"}</h1>
              <p className="text-sm text-muted-foreground">Keyingi safar telefon raqam va shu parol bilan kirasiz.</p>
              <div className="space-y-1.5"><Label htmlFor="np">Parol</Label><PasswordInput id="np" value={password} onChange={setPassword} autoComplete="new-password" /></div>
              <PasswordRules value={password} phone={phone} />
              <div className="space-y-1.5"><Label htmlFor="np2">Parolni takrorlang</Label><PasswordInput id="np2" value={password2} onChange={setPassword2} autoComplete="new-password" /></div>
              {password2 && password !== password2 && <p className="text-xs text-destructive">Parollar mos kelmadi</p>}
              <Button type="submit" className="w-full" size="lg" disabled={!pwValid || busy}>
                {busy && <Loader2 className="animate-spin" />}{mode === "reset" ? "Parolni saqlash" : "Ro‘yxatdan o‘tish"}
              </Button>
            </form>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">Demo rejim: SMS hali ulanmagan, kod — {DEMO_SMS_CODE}</p>
        <div className="mt-6 flex flex-col items-center gap-2">
          <TelegramButton start="login" />
          <Link to="/" className="text-xs text-muted-foreground hover:underline">Bosh sahifaga qaytish</Link>
        </div>
      </main>
    </div>
  );
}
