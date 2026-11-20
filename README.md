# Daywork.uz

Kunlik ish platformasi (frontend prototip): Vite + React 19 + TypeScript + Tailwind CSS v4 + React Router.

## Ishga tushirish

```bash
npm install
npm run dev
```

Production build: `npm run build` → `dist/` (SPA: hostingda barcha yo‘llarni `index.html` ga yo‘naltiring).

## Sahifalar

| Yo‘l | Sahifa |
| --- | --- |
| `/` | Bosh sahifa |
| `/kirish` | Kirish (telefon + parol), ro‘yxatdan o‘tish, parolni tiklash |
| `/rol` | Rol tanlash |
| `/profil` | Shaxsiy ma’lumotlar va parolni o‘zgartirish |
| `/zayavkalar` | Zayavkalar lentasi (ish beruvchi reytingi bilan) |
| `/zayavka-yangi` | Yangi zayavka |
| `/mening` | Mening ishlarim: yakunlash, baholash, shikoyat |
| `/balans` | Balans, to‘ldirish (demo), referal |
| `/reyting` | Ochiq reyting va so‘nggi izohlar |
| `/u/:id` | Foydalanuvchining ommaviy profili |
| `/admin` | Admin panel (faqat adminlar) |

## Demo hisoblar

Birinchi ishga tushishda ikkita admin yaratiladi. Standart parol bilan kirgach, **avval parolni o‘zgartirish majburiy**:

| Rol | Telefon | Standart parol |
| --- | --- | --- |
| Bosh administrator | `+998 99 000 00 01` | `Admin2026!` |
| Moderator | `+998 99 000 00 02` | `Admin2026!` |

SMS kod (demo): `1234`.

## Xavfsizlik

- Parollar PBKDF2-SHA256 (600 000 iteratsiya, har bir foydalanuvchiga tasodifiy salt) bilan xeshlanadi. Parolning o‘zi saqlanmaydi.
- Parol talablari: kamida 8 belgi, harf va raqam, juda oddiy parollar va telefon raqam taqiqlangan.
- 5 marta xato parol → hisob 15 daqiqaga qulflanadi. Admin bloklashi, qulfni olishi va vaqtinchalik parol berishi mumkin.
- **Muhim:** bu hali backendsiz prototip. Barcha ma’lumotlar (hisoblar, xeshlar, rollar) brauzerning `localStorage`ida turadi —
  brauzerga kira oladigan odam ularni o‘zgartirishi mumkin (masalan, o‘zini admin qilib qo‘yishi). Haqiqiy foydalanish uchun
  hisoblar, parol tekshiruvi, rollar va urinishlar cheklovi serverga ko‘chirilishi kerak.

## Telegram bot

Tugma hozir demo oynani ochadi. Haqiqiy botni ulash uchun loyiha ildizida `.env` yarating:

```
VITE_TELEGRAM_BOT=bot_nomi
```

Shunda barcha “Telegram botga o‘tish” tugmalari `https://t.me/bot_nomi` ga olib boradi.
