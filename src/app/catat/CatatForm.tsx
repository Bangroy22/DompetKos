"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/categories";
import { formatRupiah } from "@/lib/format";

function tanggalHariIni(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function CatatForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [nominal, setNominal] = useState("");
  const [kategori, setKategori] = useState(params.get("kategori") ?? "Makan");
  const [catatan, setCatatan] = useState("");
  const [tanggal, setTanggal] = useState(tanggalHariIni());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(nominal.replace(/\D/g, ""));
    if (!amount || amount <= 0) {
      setError("Nominalnya diisi dulu ya 💸");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("expenses").insert({
      user_id: user.id,
      amount,
      category: kategori,
      note: catatan.trim() || null,
      spent_at: tanggal,
    });

    if (error) {
      setError("Gagal menyimpan. Coba lagi ya.");
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  const preview = Number(nominal.replace(/\D/g, "")) || 0;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold text-slate-800">⚡ Catat Kilat</h2>

      <form
        onSubmit={simpan}
        className="space-y-4 rounded-3xl border-2 border-violet-100 bg-white p-5 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Nominal (Rp)
          </label>
          <input
            type="number"
            inputMode="numeric"
            autoFocus
            value={nominal}
            onChange={(e) => setNominal(e.target.value)}
            placeholder="cth: 25000"
            className="w-full rounded-2xl border-2 border-slate-200 px-4 py-4 text-2xl font-extrabold text-slate-800 outline-none focus:border-fuchsia-400"
          />
          {preview > 0 && (
            <p className="mt-1 text-xs font-bold text-fuchsia-600">
              = {formatRupiah(preview)}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-slate-600">
            Kategori
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setKategori(c.name)}
                className={`rounded-2xl border-2 p-3 text-center transition active:scale-95 ${
                  kategori === c.name
                    ? "border-fuchsia-500 bg-fuchsia-50 shadow"
                    : "border-slate-100 bg-slate-50"
                }`}
              >
                <span className="text-2xl">{c.emoji}</span>
                <p className="mt-1 text-[11px] font-extrabold text-slate-700">
                  {c.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Catatan{" "}
            <span className="font-medium text-slate-400">(opsional)</span>
          </label>
          <input
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="cth: Nasi padang + es teh"
            maxLength={120}
            className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-fuchsia-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Tanggal
          </label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-fuchsia-400"
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
          className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-4 text-base font-extrabold text-white shadow-md shadow-fuchsia-200 transition active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "⏳ Menyimpan..." : "💾 Simpan Pengeluaran"}
        </button>
      </form>
    </div>
  );
}
