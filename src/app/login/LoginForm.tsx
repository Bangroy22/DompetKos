"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/Logo";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabaseSiap = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPesan(null);

    try {
      const supabase = createClient();
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: nama.trim() || undefined } },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/");
          router.refresh();
        } else {
          setPesan(
            "🎉 Pendaftaran berhasil! Cek email kamu untuk verifikasi, lalu login."
          );
          setMode("login");
        }
      }
    } catch (e) {
      setError(
        e instanceof Error ? terjemahkan(e.message) : "Terjadi kesalahan. Coba lagi ya."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loginGoogle() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch {
      setError("Gagal login dengan Google. Coba lagi ya.");
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
          DompetKos
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Catat pengeluaran, atur budget, terima insight AI ✨
        </p>
      </div>

      <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-xl shadow-brand-600/10">
        {!supabaseSiap && (
          <p className="mb-4 rounded-2xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            ⚠️ Supabase belum dikonfigurasi. Isi <code>.env.local</code> dulu ya
            (lihat README).
          </p>
        )}
        {/* Tab */}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-brand-50 p-1">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
                setPesan(null);
              }}
              className={`rounded-xl py-2.5 text-sm font-extrabold transition ${
                mode === m
                  ? "bg-white text-brand-700 shadow-md shadow-brand-600/10"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {m === "login" ? "Masuk" : "Daftar"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">
                Nama panggilan
              </label>
              <input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="cth: Roy"
                maxLength={40}
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-brand-400 focus:bg-white"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-brand-400 focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none transition focus:border-brand-400 focus:bg-white"
            />
          </div>

          {error && (
            <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600">
              ⚠️ {error}
            </p>
          )}
          {pesan && (
            <p className="rounded-2xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
              {pesan}
            </p>
          )}
          {params.get("error") && (
            <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600">
              ⚠️ Login Google gagal. Coba lagi ya.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand-800 via-brand-600 to-brand-500 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-600/30 transition active:scale-[0.98] disabled:opacity-60"
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-gold-300/25 to-transparent" />
            <span className="relative">
              {loading ? "⏳ Tunggu..." : mode === "login" ? "🚀 Masuk" : "🎉 Buat Akun"}
            </span>
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs font-bold text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          ATAU
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          onClick={loginGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-200 bg-white py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-brand-300 hover:shadow active:scale-[0.98] disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.3h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.6-5 3.6-8.7Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.2 0-5.9-2.1-6.8-5l-.1.1-3.7 2.9v.1C3.3 21.3 7.3 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.1-3.6-2.8-.1.1C.5 8.5 0 10.2 0 12s.5 3.5 1.4 5.1l3.8-2.7Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.3 2.7 1.4 6.8l3.8 2.9c.9-2.9 3.6-5 6.8-5Z"
            />
          </svg>
          Login dengan Google
        </button>
      </div>

      <p className="mt-5 text-center text-xs text-slate-400">
        Datamu aman & privat — hanya kamu yang bisa lihat 🔒
      </p>
      <p className="mt-1.5 text-center text-[11px] font-semibold text-slate-400">
        Dibuat oleh <span className="font-extrabold text-slate-500">rhsdigital</span>
      </p>
    </div>
  );
}

function terjemahkan(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Email atau password salah. Coba lagi ya.";
  if (m.includes("already registered") || m.includes("already exists"))
    return "Email ini sudah terdaftar. Silakan masuk.";
  if (m.includes("email not confirmed"))
    return "Email belum diverifikasi. Cek inbox kamu dulu ya.";
  if (m.includes("password"))
    return "Password minimal 6 karakter.";
  return msg;
}
