# 💰 DompetKos

Aplikasi pencatat pengeluaran buat anak kos & mahasiswa — lengkap dengan budget
bulanan, grafik, insight AI, rangkuman bulanan (cetak/PDF), dan data yang
tersimpan permanen per pengguna.

**Stack:** Next.js 16 (App Router) + Tailwind CSS 4 + Supabase (Auth + Postgres + RLS) +
Chart.js + Gemini AI.

---

## 🚀 Cara menjalankan lokal

### 1. Install dependency

```bash
npm install
```

### 2. Siapkan Supabase (gratis)

1. Buat project di [supabase.com](https://supabase.com) (paket gratis cukup).
2. Buka **SQL Editor** → tempel seluruh isi `supabase/schema.sql` → **Run**.
   Ini membuat tabel `profiles`, `expenses`, `budgets`, mengaktifkan Row Level
   Security, dan trigger profil otomatis.
3. (Opsional, biar daftar langsung bisa login) Buka **Authentication →
   Providers → Email** → matikan **Confirm email**.
4. Untuk tombol **Login dengan Google**: **Authentication → Providers → Google** →
   aktifkan dan isi Client ID & Secret dari Google Cloud Console, lalu tambahkan
   URL callback `https://<domain-kamu>/auth/callback` ke Authorized redirect URI.

### 3. Isi environment variable

```bash
cp .env.example .env.local
```

Isi di `.env.local`:

| Variable | Dari mana |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API (anon key) |
| `GEMINI_API_KEY` | (opsional) [Google AI Studio](https://aistudio.google.com/apikey) — gratis. Kalau dikosongkan, Insight AI memakai analisis lokal bawaan. |

### 4. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) 🎉

---

## ☁️ Deploy ke Vercel

1. Push folder ini ke repo GitHub.
2. Di [vercel.com](https://vercel.com) → **Add New Project** → pilih repo.
3. Tambahkan ketiga environment variable di atas di **Settings → Environment Variables**.
4. **Deploy** — selesai. Setiap push ke `main` otomatis ter-deploy ulang.

> Catatan: di Supabase → **Authentication → URL Configuration**, tambahkan
> domain Vercel kamu ke **Redirect URLs**
> (`https://<domain>/auth/callback`) agar login Google/OAuth jalan di production.

## ✨ Fitur

- 🔐 Login/register email + password & Login dengan Google (Supabase Auth)
- 🏠 Dashboard: sisa uang bulan ini, donat kategori, grafik harian, insight AI
- ⚡ Catat kilat (< 10 detik): nominal, kategori, catatan, tanggal
- 🎯 Budget total + per kategori dengan progress bar & peringatan 80%
- 🤖 Insight AI via Gemini (server-side, key aman) + fallback analisis lokal
- 🧾 Riwayat: filter kategori & tanggal, edit, hapus
- 📊 Rangkuman bulanan + tombol Cetak/Simpan PDF (print CSS)
- ⚙️ Pengaturan: nama panggilan, budget, status Gemini, logout
- 🔒 Data tiap user terisolasi penuh via Row Level Security
