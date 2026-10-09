"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/Logo";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw1.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (pw1 !== pw2) {
      setError("Konfirmasi password tidak sama. Cek lagi ya.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;
      router.push("/login?reset=ok");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Gagal mengubah password. Link mungkin kedaluwarsa — minta link baru dari halaman login ya."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white shadow-xl shadow-brand-600/15 ring-4 ring-brand-100">
          <LogoMark className="h-12 w-12" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
          Buat Password Baru
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Masukkan password barumu di bawah 🔑
        </p>
      </div>

      <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-xl shadow-brand-600/10">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">
              Password baru
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-brand-400 focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">
              Konfirmasi password baru
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              placeholder="Ketik ulang password baru"
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-brand-400 focus:bg-white"
            />
          </div>

          {error && (
            <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand-800 via-brand-600 to-brand-500 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98] disabled:opacity-60"
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-gold-300/25 to-transparent" />
            <span className="relative">
              {loading ? "⏳ Menyimpan..." : "💾 Simpan password baru"}
            </span>
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-[11px] font-semibold text-slate-400">
        Made by <span className="font-extrabold text-slate-500">rhsdigital</span>
      </p>
    </div>
  );
}
