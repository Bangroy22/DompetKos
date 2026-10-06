"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, categoryMeta } from "@/lib/categories";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { RupiahInput } from "@/components/RupiahInput";

function tanggalHariIni(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  spent_at: string;
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
  const [recent, setRecent] = useState<Expense[]>([]);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user) return;
      const { data } = await supabase
        .from("expenses")
        .select("id, amount, category, note, spent_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setRecent((data ?? []).map((e) => ({ ...e, amount: Number(e.amount) || 0 })));
    })();
  }, []);

  async function hapus(id: string) {
    if (!confirm("Hapus pengeluaran ini?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (!error) setRecent((l) => l.filter((e) => e.id !== id));
  }

  async function simpanEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || editing.amount <= 0) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("expenses")
      .update({
        amount: editing.amount,
        category: editing.category,
        note: editing.note?.trim() || null,
        spent_at: editing.spent_at,
      })
      .eq("id", editing.id);
    setSaving(false);
    if (!error) {
      setRecent((l) => l.map((x) => (x.id === editing.id ? editing : x)));
      setEditing(null);
    }
  }

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
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user ?? null;
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold text-slate-800">⚡ Catat Kilat</h2>

      <form
        onSubmit={simpan}
        className="space-y-4 rounded-3xl border-2 border border-brand-100 bg-white p-5 shadow-lg shadow-brand-600/5"
      >
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Nominal (Rp)
          </label>
          <RupiahInput
            autoFocus
            value={nominal}
            onChange={setNominal}
            placeholder="cth: 25.000"
            className="w-full rounded-2xl border-2 border-slate-200 px-4 py-4 text-2xl font-extrabold text-slate-800 outline-none focus:border-brand-400"
          />
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
                    ? "border-brand-500 bg-brand-50 shadow"
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
            className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-brand-400"
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
            className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-brand-400"
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
          className="w-full rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 py-4 text-base font-extrabold text-white shadow-md shadow-brand-600/25 transition active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "⏳ Menyimpan..." : "💾 Simpan Pengeluaran"}
        </button>
      </form>

      {/* Terakhir dicatat — benerin cepat kalau salah ketik */}
      {recent.length > 0 && (
        <section className="space-y-2 rounded-3xl border border-brand-100 bg-white p-4 shadow-lg shadow-brand-600/5">
          <h3 className="text-sm font-extrabold text-slate-700">
            🕘 Terakhir dicatat
          </h3>
          <ul className="space-y-2">
            {recent.map((e) => {
              const meta = categoryMeta(e.category);
              return (
                <li
                  key={e.id}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg"
                    style={{ backgroundColor: meta.color + "22" }}
                  >
                    {meta.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-slate-800">
                      {e.note || e.category}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400">
                      {formatRupiah(e.amount)} • {formatTanggal(e.spent_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditing(e)}
                    className="shrink-0 rounded-xl bg-brand-100 px-3 py-2 text-xs font-extrabold text-brand-700"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => hapus(e.id)}
                    className="shrink-0 rounded-xl bg-rose-50 px-3 py-2 text-xs font-extrabold text-rose-600"
                  >
                    🗑️
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Modal edit */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <form
            onSubmit={simpanEdit}
            className="w-full max-w-md space-y-3 rounded-3xl bg-white p-5"
          >
            <h3 className="text-base font-extrabold text-slate-800">
              ✏️ Edit Pengeluaran
            </h3>
            <RupiahInput
              value={editing.amount ? String(editing.amount) : ""}
              onChange={(v) =>
                setEditing({ ...editing, amount: Number(v) || 0 })
              }
              placeholder="cth: 25.000"
              className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-lg font-extrabold outline-none focus:border-brand-400"
            />
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setEditing({ ...editing, category: c.name })}
                  className={`rounded-xl border-2 p-2 text-center ${
                    editing.category === c.name
                      ? "border-brand-500 bg-brand-50"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <span className="text-lg">{c.emoji}</span>
                  <p className="text-[10px] font-extrabold text-slate-700">
                    {c.name}
                  </p>
                </button>
              ))}
            </div>
            <input
              value={editing.note ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, note: e.target.value })
              }
              placeholder="Catatan"
              maxLength={120}
              className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-brand-400"
            />
            <input
              type="date"
              value={editing.spent_at}
              onChange={(e) =>
                setEditing({ ...editing, spent_at: e.target.value })
              }
              className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-brand-400"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-2xl bg-slate-100 py-3 text-sm font-extrabold text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 py-3 text-sm font-extrabold text-white disabled:opacity-60"
              >
                {saving ? "⏳..." : "💾 Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
