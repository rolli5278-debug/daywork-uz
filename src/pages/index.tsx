import { useHead } from "@/lib/head";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Phone, Percent, Gift, Star, Trophy } from "lucide-react";
import { AppHeader } from "@/components/mardikor/AppHeader";
import { JobCard } from "@/components/mardikor/JobCard";
import { Button } from "@/components/ui/button";
import { TelegramButton } from "@/components/mardikor/TelegramButton";
import { SEED_JOBS, REFERRAL_BONUS, TRUSTED_THRESHOLD, formatSum } from "@/lib/mardikor";


const steps = [
  { n: "01", t: "Telefon bilan kiring", d: "+998 raqam va 4 xonali SMS kod." },
  { n: "02", t: "Rolni tanlang", d: "Har safar: ish qoldirasizmi yoki ish qidirasizmi." },
  { n: "03", t: "Zayavka qabul qilinadi", d: "Shundan keyingina kontakt ochiladi." },
  { n: "04", t: "Ish yakunlanadi", d: "To‘lov to‘g‘ridan-to‘g‘ri, ilovadan tashqarida." },
];

export default function Index() {
  useHead("Daywork.uz — kunlik ish toping yoki ishchi toping", "Ish beruvchilar zayavka qoldiradi, ishchilar mosini qabul qiladi. Telefon va SMS orqali tasdiqlash.");
  return (
    <div className="min-h-screen">
      <AppHeader />
      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-14 md:grid-cols-[1.2fr_1fr] md:py-20">
        <div>
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">Kunlik ish · O‘zbekiston</span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.05] md:text-6xl">Bugungi ish — bugun topiladi.</h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">Ish beruvchi ish va to‘lovni yozadi, ishchi mosini tanlab qabul qiladi. Xarita yo‘q, chat yo‘q — faqat kerakli narsa.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/kirish">Boshlash <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/zayavkalar">Zayavkalarni ko‘rish</Link></Button>
          </div>
        </div>
        <div className="relative self-center">
          <div className="absolute -inset-3 -rotate-2 rounded-3xl bg-accent/40" />
          <div className="relative rotate-1"><JobCard job={SEED_JOBS[0]!} /></div>
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-12 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n}>
              <div className="font-display text-3xl font-bold text-accent">{s.n}</div>
              <h3 className="mt-2 font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { i: Phone, t: "SMS tasdiqlash", d: "Ikkala tomon ham telefon orqali tasdiqlanadi." },
          { i: Percent, t: "Atigi 1%", d: "Faqat yakunlangan ishdan, ishchi balansidan." },
          { i: Gift, t: "Do‘stni taklif qiling", d: `Ikkalangizga ${formatSum(REFERRAL_BONUS)} bonus.` },
          { i: ShieldCheck, t: "Ishonchli belgisi", d: `${TRUSTED_THRESHOLD} ta yakunlangan ishdan keyin.` },
        ].map(({ i: I, t, d }) => (
          <div key={t} className="rounded-2xl border bg-card p-5">
            <I className="h-6 w-6 text-primary" />
            <h3 className="mt-3 text-sm font-semibold">{t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>
      <section className="mx-auto max-w-5xl px-4 pb-14">
        <div className="grid gap-6 rounded-3xl bg-primary p-8 text-primary-foreground md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <div className="flex items-center gap-2 text-accent"><Star className="h-5 w-5" fill="currentColor" /><Star className="h-5 w-5" fill="currentColor" /><Star className="h-5 w-5" fill="currentColor" /><Star className="h-5 w-5" fill="currentColor" /><Star className="h-5 w-5" fill="currentColor" /></div>
            <h2 className="mt-4 text-2xl font-bold md:text-3xl">Ochiq reyting — kim bilan ishlashni oldindan biling</h2>
            <p className="mt-2 opacity-80">Har bir yakunlangan ishdan keyin ishchi ham, ish beruvchi ham bir-birini baholaydi. Muammo bo‘lsa — shikoyat qoldiring, admin ko‘rib chiqadi.</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button asChild size="lg" variant="secondary"><Link to="/reyting"><Trophy /> Reytingni ko‘rish</Link></Button>
            <TelegramButton />
          </div>
        </div>
      </section>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="mb-3 flex justify-center"><TelegramButton variant="icon" /></div>
        <div className="mb-2 flex justify-center gap-4"><Link to="/yordam" className="hover:text-primary">Yordam va FAQ</Link><Link to="/yordam#murojaat" className="hover:text-primary">Adminga murojaat</Link></div>
        © 2026 Daywork.uz · Foydalanish yoshi 18–40
      </footer>
    </div>
  );
}
