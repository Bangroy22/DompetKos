import Link from "next/link";
import { LogoMark } from "./Logo";

/**
 * Layar pembuka DompetKos — tampil saat belum login.
 * Full gradient emerald mewah dengan aksen emas, identitas sendiri.
 */
export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-gradient-to-b from-[#064e3b] via-[#047857] to-[#10b981] px-6 py-10">
      {/* Lingkaran dekorasi */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-[#D4AF37]/10 blur-2xl" />

      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        {/* Logo besar */}
        <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white shadow-2xl shadow-black/25 ring-4 ring-[#D4AF37]/60">
          <LogoMark className="h-16 w-16" />
        </div>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white">
          DompetKos
        </h1>
        <p className="mt-2 text-sm font-semibold text-emerald-50/90">
          Kawan setia uang jajanmu 🎓
        </p>

        {/* Fitur unggulan */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {["⚡ Catat kilat", "🎯 Budget kategori", "🤖 Insight AI"].map((f) => (
            <span
              key={f}
              className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/25 backdrop-blur"
            >
              {f}
            </span>
          ))}
        </div>

        {/* Tombol mulai */}
        <Link
          href="/login"
          className="mt-8 w-full rounded-2xl bg-white py-4 text-center text-base font-extrabold text-[#047857] shadow-xl shadow-black/20 ring-2 ring-[#D4AF37]/70 transition active:scale-[0.98]"
        >
          🚀 Mulai
        </Link>

        <p className="mt-4 text-[11px] font-medium leading-relaxed text-emerald-50/70">
          Dengan melanjutkan, kamu menyetujui
          <br />
          Syarat &amp; Ketentuan DompetKos
        </p>
      </div>

      <p className="relative mt-10 text-xs font-semibold text-white/60">
        Made by <span className="font-extrabold text-[#e9c767]">rhsdigital</span>
      </p>
    </div>
  );
}
