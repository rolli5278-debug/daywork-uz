// Support desk (user → admin tickets) and the FAQ that admins write and publish (step 6).
// Stored in the browser like the rest of the prototype.
import { read, write, users, type User } from "./mardikor";

// ---------------- Tickets ----------------
export type TicketStatus = "open" | "answered" | "closed";
export type TicketMessage = { id: string; authorId: string; authorName: string; fromAdmin: boolean; text: string; at: number };
export type Ticket = {
  id: string; number: number; userId: string; userName: string; category: string; subject: string;
  status: TicketStatus; createdAt: number; updatedAt: number; messages: TicketMessage[];
  assignedTo?: string; assignedName?: string;
  /** Unread flags: set when the other side writes, cleared when the ticket is opened. */
  unreadUser: boolean; unreadAdmin: boolean;
};

export const TICKET_CATEGORIES = ["Hisob va kirish", "Zayavka va ish", "To‘lov va balans", "Baholash va shikoyat", "Taklif", "Boshqa"];
export const MAX_OPEN_TICKETS = 3;
export const MAX_MESSAGE = 1000;
export const STATUS_LABEL: Record<TicketStatus, string> = { open: "Ochiq", answered: "Javob berildi", closed: "Yopilgan" };

const clean = (s: string, max: number) => s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max);
const msg = (u: User, text: string): TicketMessage => ({
  id: crypto.randomUUID(), authorId: u.id, authorName: u.role === "admin" ? (u.adminTitle ?? "Administrator") : u.name,
  fromAdmin: u.role === "admin", text: clean(text, MAX_MESSAGE), at: Date.now(),
});

const all = () => read<Ticket[]>("mk_tickets", []);
const save = (list: Ticket[]) => write("mk_tickets", list);
const patch = (id: string, fn: (t: Ticket) => Ticket) => save(all().map((t) => (t.id === id ? fn(t) : t)));

type R<T> = { ok: true; value: T } | { ok: false; error: string };

export const tickets = {
  all: () => all().sort((a, b) => b.updatedAt - a.updatedAt),
  byId: (id: string) => all().find((t) => t.id === id) ?? null,
  mine: (userId: string) => tickets.all().filter((t) => t.userId === userId),
  unreadForUser: (userId: string) => all().filter((t) => t.userId === userId && t.unreadUser).length,
  unreadForAdmin: () => all().filter((t) => t.unreadAdmin && t.status !== "closed").length,

  create: (u: User, d: { category: string; subject: string; text: string }): R<Ticket> => {
    const subject = clean(d.subject, 100), text = clean(d.text, MAX_MESSAGE);
    if (!TICKET_CATEGORIES.includes(d.category)) return { ok: false, error: "Bo‘limni tanlang." };
    if (subject.length < 5) return { ok: false, error: "Mavzu kamida 5 belgi bo‘lsin." };
    if (text.length < 10) return { ok: false, error: "Murojaatni batafsilroq yozing (kamida 10 belgi)." };
    if (tickets.mine(u.id).filter((t) => t.status !== "closed").length >= MAX_OPEN_TICKETS)
      return { ok: false, error: `Bir vaqtda ${MAX_OPEN_TICKETS} tadan ortiq ochiq murojaat bo‘lmaydi. Avvalgilarini yoping.` };
    const list = all();
    const t: Ticket = {
      id: crypto.randomUUID(), number: 1001 + list.length, userId: u.id, userName: u.name, category: d.category, subject,
      status: "open", createdAt: Date.now(), updatedAt: Date.now(), messages: [msg(u, text)], unreadUser: false, unreadAdmin: true,
    };
    save([t, ...list]);
    return { ok: true, value: t };
  },

  /** Owner or any admin may reply. An admin reply marks the ticket "answered"; a user reply re-opens it. */
  reply: (id: string, u: User, text: string): string | null => {
    const t = tickets.byId(id);
    if (!t) return "Murojaat topilmadi.";
    if (!canAccess(t, u)) return "Ruxsat yo‘q.";
    if (clean(text, MAX_MESSAGE).length < 2) return "Xabar bo‘sh.";
    const admin = u.role === "admin";
    patch(id, (x) => ({
      ...x, messages: [...x.messages, msg(u, text)], updatedAt: Date.now(),
      status: admin ? "answered" : "open", unreadUser: admin, unreadAdmin: !admin,
      ...(admin && !x.assignedTo ? { assignedTo: u.id, assignedName: u.name } : {}),
    }));
    return null;
  },

  setStatus: (id: string, u: User, status: TicketStatus): string | null => {
    const t = tickets.byId(id);
    if (!t || !canAccess(t, u)) return "Ruxsat yo‘q.";
    if (u.role !== "admin" && status !== "closed") return "Faqat admin holatni o‘zgartira oladi.";
    patch(id, (x) => ({ ...x, status, updatedAt: Date.now(), unreadUser: u.role === "admin" ? true : x.unreadUser }));
    return null;
  },

  assign: (id: string, admin: User) => patch(id, (x) => ({ ...x, assignedTo: admin.id, assignedName: admin.name })),

  markRead: (id: string, u: User) => {
    const t = tickets.byId(id);
    if (!t) return;
    if (u.role === "admin" && t.unreadAdmin) patch(id, (x) => ({ ...x, unreadAdmin: false }));
    else if (t.userId === u.id && t.unreadUser) patch(id, (x) => ({ ...x, unreadUser: false }));
  },
};

export const canAccess = (t: Ticket, u: User | null) => !!u && (u.role === "admin" || t.userId === u.id);

// ---------------- FAQ ----------------
export type FaqStatus = "draft" | "published";
export type Faq = {
  id: string; category: string; question: string; answer: string; status: FaqStatus;
  authorId: string; authorName: string; createdAt: number; updatedAt: number; publishedAt?: number; order: number;
};
export const FAQ_CATEGORIES = ["Umumiy", "Hisob va xavfsizlik", "Ish beruvchilar uchun", "Ishchilar uchun", "To‘lov va balans", "Reyting va shikoyatlar"];

const now = Date.now();
const seedFaq = (id: string, order: number, category: string, question: string, answer: string): Faq => ({
  id, order, category, question, answer, status: "published", authorId: "MK000001", authorName: "Bosh administrator",
  createdAt: now, updatedAt: now, publishedAt: now,
});
/** Starter FAQ shipped with the app; admins can edit, unpublish or delete these like any other item. */
export const SEED_FAQ: Faq[] = [
  seedFaq("faq-1", 1, "Umumiy", "Daywork.uz nima?", "Kunlik va vaqtinchalik ish uchun platforma: ish beruvchi zayavka qoldiradi, ishchi mosini tanlab qabul qiladi. To‘lov to‘g‘ridan-to‘g‘ri, ilovadan tashqarida amalga oshiriladi."),
  seedFaq("faq-2", 2, "Umumiy", "Kimlar foydalana oladi?", "18 yoshdan 40 yoshgacha bo‘lgan, O‘zbekiston telefon raqamiga ega foydalanuvchilar."),
  seedFaq("faq-3", 3, "Hisob va xavfsizlik", "Parolimni unutdim. Nima qilaman?", "Kirish sahifasida “Parolni unutdingizmi?” tugmasini bosing, telefon raqamingizga kelgan kodni kiriting va yangi parol o‘rnating."),
  seedFaq("faq-4", 4, "Hisob va xavfsizlik", "Hisobim qulflanib qoldi.", "5 marta noto‘g‘ri parol kiritilsa, hisob 15 daqiqaga qulflanadi. Kuting yoki parolni tiklang. Muammo davom etsa, murojaat qoldiring."),
  seedFaq("faq-5", 5, "To‘lov va balans", "Komissiya qancha?", "Faqat yakunlangan ishdan 1%, ishchi balansidan yechiladi. Zayavka joylash bepul."),
  seedFaq("faq-6", 6, "Reyting va shikoyatlar", "Shikoyatimni kim ko‘radi?", "Shikoyatlarni faqat administratorlar ko‘radi. Tasdiqlangan shikoyatlar soni foydalanuvchining ommaviy profilida ko‘rsatiladi."),
];

const faqAll = (): Faq[] => {
  const stored = read<Faq[] | null>("mk_faq", null);
  return stored ?? SEED_FAQ; // first run: start from the seed list
};
const faqSave = (list: Faq[]) => write("mk_faq", list);

export const faq = {
  all: () => faqAll().sort((a, b) => a.order - b.order),
  published: () => faq.all().filter((f) => f.status === "published"),
  byId: (id: string) => faqAll().find((f) => f.id === id) ?? null,

  /** Admin only. Returns an error or null. */
  upsert: (admin: User, d: { id?: string; category: string; question: string; answer: string }): R<Faq> => {
    if (admin.role !== "admin") return { ok: false, error: "Faqat admin FAQ yarata oladi." };
    const question = clean(d.question, 200), answer = clean(d.answer, 2000);
    if (!FAQ_CATEGORIES.includes(d.category)) return { ok: false, error: "Bo‘limni tanlang." };
    if (question.length < 5) return { ok: false, error: "Savol kamida 5 belgi bo‘lsin." };
    if (answer.length < 10) return { ok: false, error: "Javob kamida 10 belgi bo‘lsin." };
    const list = faqAll();
    if (d.id) {
      const ex = list.find((f) => f.id === d.id);
      if (!ex) return { ok: false, error: "Topilmadi." };
      const upd = { ...ex, category: d.category, question, answer, updatedAt: Date.now() };
      faqSave(list.map((f) => (f.id === d.id ? upd : f)));
      return { ok: true, value: upd };
    }
    const f: Faq = {
      id: crypto.randomUUID(), category: d.category, question, answer, status: "draft", authorId: admin.id,
      authorName: admin.adminTitle ?? admin.name, createdAt: Date.now(), updatedAt: Date.now(),
      order: Math.max(0, ...list.map((x) => x.order)) + 1,
    };
    faqSave([...list, f]);
    return { ok: true, value: f };
  },
  /** "Tizimga ulashish": publish to the public help centre (or take it back to draft). */
  setStatus: (admin: User, id: string, status: FaqStatus) => {
    if (admin.role !== "admin") return;
    faqSave(faqAll().map((f) => (f.id === id ? { ...f, status, updatedAt: Date.now(), publishedAt: status === "published" ? Date.now() : f.publishedAt } : f)));
  },
  remove: (admin: User, id: string) => { if (admin.role === "admin") faqSave(faqAll().filter((f) => f.id !== id)); },
  move: (admin: User, id: string, dir: -1 | 1) => {
    if (admin.role !== "admin") return;
    const list = faq.all(); const i = list.findIndex((f) => f.id === id); const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    const a = list[i]!, b = list[j]!;
    faqSave(list.map((f) => (f.id === a.id ? { ...f, order: b.order } : f.id === b.id ? { ...f, order: a.order } : f)));
  },
};

export const faqLink = (id: string) => `${location.origin}/yordam#${id}`;
export const adminName = (id?: string) => (id ? users.byId(id)?.name : undefined);
