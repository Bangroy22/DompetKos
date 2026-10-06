"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
    <div className="pt-6">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 text-3xl shadow-lg shadow-fuchsia-200">
          💰
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800">DompetKos</h1>
        <p className="text-sm text-slate-500">
          Catat pengeluaran, atur budget, terima insight AI ✨
        </p>
      </div>

      <div className="rounded-3xl border-2 border-violet-100 bg-white p-5 shadow-sm">
        {!supabaseSiap && (
          <p className="mb-4 rounded-2xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            ⚠️ Supabase belum dikonfigurasi. Isi <code>.env.local</code> dulu ya
            (lihat README).
          </p>
        )}
        {/* Tab */}
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
                setPesan(null);
              }}
              className={`rounded-xl py-2 text-sm font-extrabold transition ${
                mode === m
                  ? "bg-white text-fuchsia-600 shadow"
                  : "text-slate-500"
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
                className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-fuchsia-400"
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
              className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-fuchsia-400"
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
              className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-fuchsia-400"
            />
          </div>

          {error && (
            <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600">
              ⚠️ {error}
            </p>
          )}
          {pesan && (
            <p className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
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
            className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-3 text-sm font-extrabold text-white shadow-md shadow-fuchsia-200 transition active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "⏳ Tunggu..." : mode === "login" ? "🚀 Masuk" : "🎉 Buat Akun"}
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
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white py-3 text-sm font-extrabold text-slate-700 transition active:scale-[0.98] disabled:opacity-60"
        >
          <span className="text-lg">🔵</span> Login dengan Google
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Datamu aman & privat — hanya kamu yang bisa lihat 🔒
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
