// Ratings, public reviews and complaints (step 5). Stored in the browser like the rest of the prototype.
import { read, write, users, SEED_JOBS, employerIdFor } from "./mardikor";

export type RatedRole = "worker" | "employer";
export type Review = {
  id: string; acceptanceId: string; jobId: string; jobTitle: string;
  fromId: string; fromName: string; toId: string; toName: string; toRole: RatedRole;
  stars: number; comment: string; at: number; hidden?: boolean;
};
export type ComplaintStatus = "new" | "resolved" | "rejected";
export type Complaint = {
  id: string; acceptanceId: string; jobId: string; jobTitle: string;
  fromId: string; fromName: string; againstId: string; againstName: string;
  reason: string; text: string; at: number; status: ComplaintStatus; adminNote?: string; handledBy?: string;
};

export const MAX_COMMENT = 500;
export const COMPLAINT_REASONS = [
  "Ishga kelmadi", "To‘lov qilinmadi yoki kam to‘landi", "Qo‘pol muomala", "Ish sifati past",
  "Shartlar e’londagidan farq qildi", "Firibgarlik", "Boshqa",
];

const H = 3600_000;
const seedReview = (id: string, jobIdx: number, fromName: string, stars: number, comment: string, ago: number): Review => {
  const j = SEED_JOBS[jobIdx]!;
  return { id, acceptanceId: "seed-" + id, jobId: j.id, jobTitle: j.title, fromId: "DEMO-" + id, fromName, toId: employerIdFor(j), toName: j.employer, toRole: "employer", stars, comment, at: Date.now() - ago * H };
};
/** Demo reviews so the public pages are not empty. */
export const SEED_REVIEWS: Review[] = [
  seedReview("r1", 0, "Otabek S.", 5, "Vaqtida to‘ladi, ish aytilganidek bo‘ldi.", 30),
  seedReview("r2", 0, "Javlon T.", 4, "Yaxshi ish beruvchi, faqat biroz kechikdi.", 54),
  seedReview("r3", 1, "Rustam N.", 5, "Bo‘yoq va asboblar tayyor edi. Rahmat!", 80),
  seedReview("r4", 3, "Sherzod B.", 3, "To‘lov joyida, lekin ish hajmi e’londagidan ko‘p chiqdi.", 100),
  seedReview("r5", 5, "Ulug‘bek K.", 5, "Tushlik berildi, muomala yaxshi.", 130),
];

const clampStars = (n: number) => Math.min(5, Math.max(1, Math.round(n)));
const clean = (s: string) => s.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, MAX_COMMENT);

export const reviewStore = {
  all: () => [...read<Review[]>("mk_reviews", []), ...SEED_REVIEWS.filter((s) => !read<string[]>("mk_reviews_seed_hidden", []).includes(s.id))],
  /** Includes admin-hidden demo reviews (for the admin panel). */
  allForAdmin: () => {
    const hidden = read<string[]>("mk_reviews_seed_hidden", []);
    return [...read<Review[]>("mk_reviews", []), ...SEED_REVIEWS.map((s) => ({ ...s, hidden: hidden.includes(s.id) }))];
  },
  /** What visitors may see: not hidden by an admin, and neither side is a blocked account. */
  publicAll: () => reviewStore.all().filter((r) => !r.hidden && !users.byId(r.toId)?.blocked && !users.byId(r.fromId)?.blocked),
  mine: (acceptanceId: string, fromId: string) => reviewStore.all().find((r) => r.acceptanceId === acceptanceId && r.fromId === fromId) ?? null,
  /** Returns an error message or null. One review per side per completed job. */
  add: (r: Omit<Review, "id" | "at" | "hidden">): string | null => {
    if (r.fromId === r.toId) return "O‘zingizni baholay olmaysiz.";
    if (reviewStore.mine(r.acceptanceId, r.fromId)) return "Siz bu ish uchun allaqachon baho qoldirgansiz.";
    const stars = clampStars(r.stars);
    write("mk_reviews", [{ ...r, stars, comment: clean(r.comment), id: crypto.randomUUID(), at: Date.now() }, ...read<Review[]>("mk_reviews", [])]);
    return null;
  },
  setHidden: (id: string, hidden: boolean) => {
    if (SEED_REVIEWS.some((s) => s.id === id)) {
      const list = read<string[]>("mk_reviews_seed_hidden", []).filter((x) => x !== id);
      write("mk_reviews_seed_hidden", hidden ? [...list, id] : list);
    } else write("mk_reviews", read<Review[]>("mk_reviews", []).map((r) => (r.id === id ? { ...r, hidden } : r)));
  },
};

export const complaintStore = {
  all: () => read<Complaint[]>("mk_complaints", []),
  /** Returns an error message or null. One open complaint per side per job. */
  add: (c: Omit<Complaint, "id" | "at" | "status">): string | null => {
    if (c.fromId === c.againstId) return "O‘zingizga shikoyat qila olmaysiz.";
    if (!COMPLAINT_REASONS.includes(c.reason)) return "Sababni tanlang.";
    const text = clean(c.text);
    if (text.length < 10) return "Shikoyatni batafsilroq yozing (kamida 10 belgi).";
    if (complaintStore.all().some((x) => x.acceptanceId === c.acceptanceId && x.fromId === c.fromId && x.status === "new"))
      return "Bu ish bo‘yicha ko‘rib chiqilayotgan shikoyatingiz bor.";
    write("mk_complaints", [{ ...c, text, id: crypto.randomUUID(), at: Date.now(), status: "new" }, ...complaintStore.all()]);
    return null;
  },
  setStatus: (id: string, status: ComplaintStatus, adminNote: string, handledBy: string) =>
    write("mk_complaints", complaintStore.all().map((c) => (c.id === id ? { ...c, status, adminNote: clean(adminNote), handledBy } : c))),
};

export type Stats = { avg: number; count: number; asWorker: { avg: number; count: number }; asEmployer: { avg: number; count: number }; confirmedComplaints: number };
const avgOf = (rs: Review[]) => ({ count: rs.length, avg: rs.length ? rs.reduce((s, r) => s + r.stars, 0) / rs.length : 0 });

/** Public rating summary for one person (hidden reviews excluded). */
export function statsFor(id: string): Stats {
  const rs = reviewStore.publicAll().filter((r) => r.toId === id);
  return {
    ...avgOf(rs),
    asWorker: avgOf(rs.filter((r) => r.toRole === "worker")),
    asEmployer: avgOf(rs.filter((r) => r.toRole === "employer")),
    confirmedComplaints: complaintStore.all().filter((c) => c.againstId === id && c.status === "resolved").length,
  };
}

export type RankRow = { id: string; name: string; avg: number; count: number };
/** Public leaderboard for one role, best rated first. */
export function leaderboard(role: RatedRole): RankRow[] {
  const by = new Map<string, Review[]>();
  for (const r of reviewStore.publicAll()) if (r.toRole === role) by.set(r.toId, [...(by.get(r.toId) ?? []), r]);
  return [...by.entries()]
    .map(([id, rs]) => ({ id, name: users.byId(id)?.name ?? rs[0]!.toName, ...avgOf(rs) }))
    .sort((a, b) => b.avg - a.avg || b.count - a.count);
}

export const fmtAvg = (n: number) => n.toFixed(1).replace(".", ",");
