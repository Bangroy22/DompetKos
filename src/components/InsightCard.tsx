"use client";

import { useState } from "react";

export default function InsightCard() {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function minta() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insight", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal meminta insight");
      setInsight(json.insight);
      setSource(json.source);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-lg shadow-brand-600/5">
      <div className="flex items-center justify-between bg-gradient-to-r from-brand-700 to-brand-600 px-4 py-3">
        <h2 className="text-sm font-extrabold text-white">
          🤖 Insight
        </h2>
        {source && (
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white">
            {source === "gemini" ? "✨ Gemini AI" : "🧠 Analisis lokal"}
          </span>
        )}
      </div>

      <div className="p-4">
        {insight ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {insight}
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            Pencet tombolnya, biar AI bacain pola pengeluaranmu dan kasih saran
            hemat yang pas. 👇
          </p>
        )}

        {error && (
          <p className="mt-2 text-sm font-semibold text-rose-600">{error}</p>
        )}

        <button
          onClick={minta}
          disabled={loading}
          className="mt-3 w-full rounded-2xl bg-gradient-to-r from-glow-500 to-amber-400 py-3 text-sm font-extrabold text-white shadow-lg shadow-amber-500/25 transition active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "⏳ Lagi mikir..." : "✨ Minta Insight AI"}
        </button>
      </div>
    </section>
  );
}
