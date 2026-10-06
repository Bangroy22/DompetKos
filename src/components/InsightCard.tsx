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
    <section className="rounded-3xl border-2 border-violet-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-slate-800">
          🤖 Insight AI Bulan Ini
        </h2>
        {source && (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
            {source === "gemini" ? "✨ Gemini AI" : "🧠 Analisis lokal"}
          </span>
        )}
      </div>

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
        className="mt-3 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-3 text-sm font-extrabold text-white shadow-md shadow-fuchsia-200 transition active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? "⏳ Lagi mikir..." : "✨ Minta Insight AI"}
      </button>
    </section>
  );
}
