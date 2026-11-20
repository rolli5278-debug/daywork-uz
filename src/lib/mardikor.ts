// Core Mardikor rules + demo data (frontend prototype, stored in the browser).
export const MIN_AGE = 18;
export const MAX_AGE = 40;
export const COMMISSION_RATE = 0.01;
export const MAX_ACTIVE_JOBS = 5;
export const TRUSTED_THRESHOLD = 10;
export const REFERRAL_BONUS = 5000;
export const DEMO_SMS_CODE = "1234";

export function ageOn(birth: Date, today = new Date()): number {
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
export const isAllowedAge = (birth: Date, today = new Date()) => {
  const a = ageOn(birth, today);
  return a >= MIN_AGE && a <= MAX_AGE;
};
export const commissionFor = (pay: number) => Math.round(pay * COMMISSION_RATE);
export const isValidUzPhone = (digits: string) => /^\d{9}$/.test(digits);
export const formatSum = (n: number) => n.toLocaleString("ru-RU").replace(/,/g, " ") + " so‘m";

export const REGIONS: Record<string, string[]> = {
  "Qoraqalpog‘iston Respublikasi": ["Nukus sh.", "Amudaryo", "Beruniy", "Bo‘zatov", "Chimboy", "Ellikqal’a", "Kegeyli", "Mo‘ynoq", "Qanliko‘l", "Qo‘ng‘irot", "Qorao‘zak", "Shumanay", "Taxtako‘prik", "To‘rtko‘l", "Xo‘jayli", "Taxiatosh"],
  "Andijon viloyati": ["Andijon sh.", "Andijon tumani", "Asaka", "Baliqchi", "Bo‘z", "Buloqboshi", "Izboskan", "Jalolquduq", "Marhamat", "Oltinko‘l", "Paxtaobod", "Qo‘rg‘ontepa", "Shahrixon", "Ulug‘nor", "Xo‘jaobod"],
  "Buxoro viloyati": ["Buxoro sh.", "Buxoro tumani", "Vobkent", "G‘ijduvon", "Jondor", "Kogon sh.", "Kogon tumani", "Olot", "Peshku", "Qorako‘l", "Qorovulbozor", "Romitan", "Shofirkon"],
  "Farg‘ona viloyati": ["Farg‘ona sh.", "Farg‘ona tumani", "Beshariq", "Bog‘dod", "Buvayda", "Dang‘ara", "Furqat", "Marg‘ilon sh.", "Oltiariq", "Qo‘qon sh.", "Qushtepa", "Quva", "Quvasoy sh.", "Rishton", "So‘x", "Toshloq", "Uchko‘prik", "Yozyovon"],
  "Jizzax viloyati": ["Jizzax sh.", "Arnasoy", "Baxmal", "Do‘stlik", "Forish", "G‘allaorol", "Mirzacho‘l", "Paxtakor", "Sharof Rashidov", "Yangiobod", "Zafarobod", "Zarbdor", "Zomin"],
  "Xorazm viloyati": ["Urganch sh.", "Urganch tumani", "Bog‘ot", "Gurlan", "Hazorasp", "Xiva sh.", "Xonqa", "Qo‘shko‘pir", "Shovot", "Tuproqqal’a", "Yangiariq", "Yangibozor"],
  "Namangan viloyati": ["Namangan sh.", "Namangan tumani", "Chortoq", "Chust", "Kosonsoy", "Mingbuloq", "Norin", "Pop", "To‘raqo‘rg‘on", "Uchqo‘rg‘on", "Uychi", "Yangiqo‘rg‘on"],
  "Navoiy viloyati": ["Navoiy sh.", "Zarafshon sh.", "G‘ozg‘on", "Karmana", "Konimex", "Navbahor", "Nurota", "Qiziltepa", "Tomdi", "Uchquduq", "Xatirchi"],
  "Qashqadaryo viloyati": ["Qarshi sh.", "Qarshi tumani", "Chiroqchi", "Dehqonobod", "G‘uzor", "Qamashi", "Kasbi", "Kitob", "Koson", "Ko‘kdala", "Mirishkor", "Muborak", "Nishon", "Shahrisabz sh.", "Yakkabog‘"],
  "Samarqand viloyati": ["Samarqand sh.", "Samarqand tumani", "Bulung‘ur", "Ishtixon", "Jomboy", "Kattaqo‘rg‘on sh.", "Kattaqo‘rg‘on tumani", "Narpay", "Nurobod", "Oqdaryo", "Paxtachi", "Pastdarg‘om", "Qo‘shrabot", "Toyloq", "Urgut"],
  "Sirdaryo viloyati": ["Guliston sh.", "Guliston tumani", "Shirin sh.", "Yangiyer sh.", "Boyovut", "Mirzaobod", "Oqoltin", "Sardoba", "Sayxunobod", "Sirdaryo tumani", "Xovos"],
  "Surxondaryo viloyati": ["Termiz sh.", "Termiz tumani", "Angor", "Bandixon", "Boysun", "Denov", "Jarqo‘rg‘on", "Muzrabot", "Oltinsoy", "Qiziriq", "Qumqo‘rg‘on", "Sariosiyo", "Sherobod", "Sho‘rchi", "Uzun"],
  "Toshkent viloyati": ["Nurafshon sh.", "Angren sh.", "Bekobod sh.", "Chirchiq sh.", "Olmaliq sh.", "Ohangaron sh.", "Yangiyo‘l sh.", "Bekobod tumani", "Bo‘ka", "Bo‘stonliq", "Chinoz", "Ohangaron tumani", "Oqqo‘rg‘on", "O‘rtachirchiq", "Parkent", "Piskent", "Qibray", "Quyichirchiq", "Toshkent tumani", "Yuqorichirchiq", "Zangiota"],
  "Toshkent shahri": ["Bektemir", "Chilonzor", "Mirobod", "Mirzo Ulug‘bek", "Olmazor", "Sergeli", "Shayxontohur", "Uchtepa", "Yakkasaroy", "Yashnobod", "Yangihayot", "Yunusobod"],
};

export const JOB_TYPES = [
  "Qurilish ishchisi", "Elektrik", "Santexnik", "Bo‘yoqchi", "Payvandchi", "Duradgor",
  "Yuk tashuvchi", "Ko‘chirish", "Tozalash", "Bog‘bon", "Qishloq xo‘jaligi", "Haydovchi",
  "Ombor ishchisi", "Oshxona yordamchisi", "Boshqa",
];

export type Job = {
  id: string; type: string; title: string; description: string; pay: number;
  date: string; region: string; district: string; slots: number; taken: number;
  employer: string; createdAt: number; employerId?: string; employerPhone?: string;
};

const h = 3600_000;
export const SEED_JOBS: Job[] = [
  { id: "z1", type: "Yuk tashuvchi", title: "Mebel ko‘chirishga 3 kishi", description: "3-qavatdan mebelni yuk mashinasiga ortish. Lift yo‘q.", pay: 150000, date: "2026-11-19", region: "Toshkent shahri", district: "Chilonzor", slots: 3, taken: 1, employer: "Dilshod A.", createdAt: Date.now() - 1 * h },
  { id: "z2", type: "Bo‘yoqchi", title: "2 xonali kvartira devorlarini bo‘yash", description: "Bo‘yoq va asbob bizdan. Taxminan 1 kunlik ish.", pay: 400000, date: "2026-11-20", region: "Toshkent shahri", district: "Yunusobod", slots: 1, taken: 0, employer: "Malika R.", createdAt: Date.now() - 3 * h },
  { id: "z3", type: "Tozalash", title: "Ta’mirdan keyin uy tozalash", description: "Qurilish changini tozalash, oynalarni yuvish.", pay: 200000, date: "2026-11-19", region: "Toshkent shahri", district: "Chilonzor", slots: 2, taken: 0, employer: "Sardor K.", createdAt: Date.now() - 5 * h },
  { id: "z4", type: "Santexnik", title: "Hammomda quvur almashtirish", description: "Eski metall quvurlarni plastikka almashtirish.", pay: 350000, date: "2026-11-21", region: "Toshkent shahri", district: "Mirzo Ulug‘bek", slots: 1, taken: 0, employer: "Aziza T.", createdAt: Date.now() - 8 * h },
  { id: "z5", type: "Bog‘bon", title: "Hovlidagi daraxtlarni butash", description: "12 ta meva daraxti, qaychi bor.", pay: 180000, date: "2026-11-22", region: "Toshkent viloyati", district: "Qibray", slots: 2, taken: 1, employer: "Bahodir U.", createdAt: Date.now() - 20 * h },
  { id: "z6", type: "Qurilish ishchisi", title: "Beton quyishga yordamchi", description: "Ertalab 8:00 dan. Tushlik beriladi.", pay: 220000, date: "2026-11-20", region: "Toshkent shahri", district: "Sergeli", slots: 4, taken: 2, employer: "Jasur M.", createdAt: Date.now() - 26 * h },
];

export type Profile = { phone: string; name: string; region: string; district: string; id: string; balance: number; completed: number };

export const read = <T,>(k: string, fb: T): T => {
  if (typeof window === "undefined") return fb;
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fb; } catch { return fb; }
};
export const write = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));

// ---- Accounts (step 4): users with hashed passwords, roles and a session ----
export type Role = "user" | "admin";
/** PBKDF2-SHA256 password record. The plain password is never stored. */
export type PwRecord = { alg: "PBKDF2-SHA256"; iter: number; salt: string; hash: string };
export type User = Profile & {
  role: Role; adminTitle?: string; pw: PwRecord; mustChangePw?: boolean; blocked?: boolean;
  failed: number; lockUntil: number; createdAt: number;
};
export const users = {
  all: () => read<User[]>("mk_users", []),
  save: (list: User[]) => write("mk_users", list),
  byId: (id: string) => read<User[]>("mk_users", []).find((u) => u.id === id) ?? null,
  byPhone: (phone: string) => read<User[]>("mk_users", []).find((u) => u.phone === phone) ?? null,
  update: (id: string, patch: Partial<User>) => write("mk_users", read<User[]>("mk_users", []).map((u) => (u.id === id ? { ...u, ...patch } : u))),
};
export const session = {
  get: () => read<string | null>("mk_session", null),
  set: (id: string) => write("mk_session", id),
  clear: () => localStorage.removeItem("mk_session"),
};
/** Stable ID for a job's employer (seed jobs have no registered employer account). */
export const employerIdFor = (job: Job) => job.employerId ?? "EMP-" + job.id;

export const store = {
  /** Currently logged-in, non-blocked user (or null). */
  profile: (): User | null => {
    const id = session.get();
    const u = id ? users.byId(id) : null;
    return u && !u.blocked ? u : null;
  },
  /** Merges profile fields (balance, name, …) into the stored user. */
  saveProfile: (p: Profile) => users.update(p.id, { name: p.name, region: p.region, district: p.district, balance: p.balance, completed: p.completed }),
  logout: () => session.clear(),
  jobs: () => [...read<Job[]>("mk_jobs", []), ...SEED_JOBS],
  addJob: (j: Job) => write("mk_jobs", [j, ...read<Job[]>("mk_jobs", [])]),
  myActiveCount: () => read<Job[]>("mk_jobs", []).length,
  acceptances: () => read<Acceptance[]>("mk_acc", []),
  saveAcceptances: (a: Acceptance[]) => write("mk_acc", a),
};

// ---- Step 2: accept → contact → two-sided completion ----
export type Acceptance = {
  id: string; jobId: string; workerId: string; workerName: string; workerPhone: string;
  employerDone: boolean; workerDone: boolean; status: "active" | "done"; at: number;
};

export const takenCount = (job: Job, acc: Acceptance[]) => job.taken + acc.filter((a) => a.jobId === job.id).length;

/** Returns an error message, or null if the worker may accept this job. */
export function acceptError(job: Job, acc: Acceptance[], workerId: string): string | null {
  if (job.employerId === workerId) return "O‘z zayavkangizni qabul qila olmaysiz.";
  if (acc.some((a) => a.jobId === job.id && a.workerId === workerId)) return "Siz bu zayavkani allaqachon qabul qilgansiz.";
  if (takenCount(job, acc) >= job.slots) return "Barcha o‘rinlar band.";
  return null;
}

/** Marks one side as done; job is completed only when both sides confirm. */
export function confirmSide(a: Acceptance, side: "employer" | "worker"): Acceptance {
  const n = { ...a, employerDone: a.employerDone || side === "employer", workerDone: a.workerDone || side === "worker" };
  return { ...n, status: n.employerDone && n.workerDone ? "done" : "active" };
}

export const seedPhone = (job: Job) => job.employerPhone ?? "+998 90 " + (1000000 + (job.id.charCodeAt(1) * 7919) % 9000000).toString().slice(0, 7);

export const generateUserId = () => "MK" + Math.floor(100000 + Math.random() * 900000);

// ---- Step 3: balance, transactions, referral ----
export const TOPUP_AMOUNTS = [10000, 20000, 50000, 100000];
export type Tx = { id: string; kind: "topup" | "commission" | "referral"; amount: number; note: string; at: number };
export const txStore = {
  list: () => read<Tx[]>("mk_tx", []),
  add: (t: Omit<Tx, "id" | "at">) => write("mk_tx", [{ ...t, id: crypto.randomUUID(), at: Date.now() }, ...read<Tx[]>("mk_tx", [])]),
  usedReferral: () => read<boolean>("mk_ref_used", false),
  markReferral: () => write("mk_ref_used", true),
};
/** Worker with negative balance cannot accept new jobs. */
export const isBalanceBlocked = (p: { balance: number }) => p.balance < 0;
/** Referral code is valid if it looks like a user ID and is not your own. */
export const referralError = (code: string, ownId: string, used: boolean): string | null => {
  if (used) return "Referal kod allaqachon ishlatilgan.";
  if (!/^MK\d{6}$/.test(code)) return "Kod noto‘g‘ri (masalan: MK123456).";
  if (code === ownId) return "O‘z kodingizni kirita olmaysiz.";
  return null;
};
