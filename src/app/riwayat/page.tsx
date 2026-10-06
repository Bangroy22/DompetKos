"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, categoryMeta } from "@/lib/categories";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { RupiahInput } from "@/components/RupiahInput";

interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  spent_at: string;
}

export default function RiwayatPage() {
  const [list, setList] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKat, setFilterKat] = useState("Semua");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);

  async function muat() {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("expenses")
      .select("id, amount, category, note, spent_at")
      .eq("user_id", user.id)
      .order("spent_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(500);
    setList(
      (data ?? []).map((e) => ({ ...e, amount: Number(e.amount) || 0 }))
    );
    setLoading(false);
  }

  useEffect(() => {
    muat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () =>
      list.filter(
        (e) =>
          (filterKat === "Semua" || e.category === filterKat) &&
          (!dari || e.spent_at >= dari) &&
          (!sampai || e.spent_at <= sampai)
      ),
    [list, filterKat, dari, sampai]
  );

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  async function hapus(id: string) {
    if (!confirm("Hapus pengeluaran ini?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (!error) setList((l) => l.filter((e) => e.id !== id));
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
      setList((l) => l.map((x) => (x.id === editing.id ? editing : x)));
      setEditing(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-slate-800">🧾 Riwayat</h2>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-extrabold text-brand-700">
          {formatRupiah(total)}
        </span>
      </div>

      {/* Filter */}
      <section className="space-y-2 rounded-3xl border border-brand-100 bg-white p-4 shadow-lg shadow-brand-600/5">
        <div className="flex flex-wrap gap-1.5">
          {["Semua", ...CATEGORIES.map((c) => c.name)].map((k) => (
            <button
              key={k}
              onClick={() => setFilterKat(k)}
              className={`rounded-full px-3 py-1.5 text-xs font-extrabold transition ${
                filterKat === k
                  ? "bg-gradient-to-r from-brand-700 to-brand-500 text-white shadow"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={dari}
            onChange={(e) => setDari(e.target.value)}
            className="rounded-xl border-2 border-slate-200 px-3 py-2 text-xs font-semibold"
          />
          <input
            type="date"
            value={sampai}
            onChange={(e) => setSampai(e.target.value)}
            className="rounded-xl border-2 border-slate-200 px-3 py-2 text-xs font-semibold"
          />
        </div>
      </section>

      {/* Daftar */}
      {loading ? (
        <p className="py-8 text-center text-sm font-bold text-slate-400">
          ⏳ Memuat riwayat...
        </p>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-brand-200 bg-white/70 p-8 text-center">
          <p className="text-4xl">🗒️</p>
          <p className="mt-2 text-sm font-extrabold text-slate-700">
            {list.length === 0
              ? "Belum ada pengeluaran tercatat"
              : "Tidak ada yang cocok dengan filter"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {list.length === 0
              ? "Yuk catat pengeluaran pertamamu!"
              : "Coba ubah filter di atas ya."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((e) => {
            const meta = categoryMeta(e.category);
            return (
              <li
                key={e.id}
                className="flex items-center gap-3 rounded-2xl border-2 border-white bg-white p-3 shadow-sm"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl"
                  style={{ backgroundColor: meta.color + "22" }}
                >
                  {meta.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-slate-800">
                    {e.note || e.category}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400">
                    {meta.name} • {formatTanggal(e.spent_at)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-extrabold text-slate-800">
                  {formatRupiah(e.amount)}
                </p>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    onClick={() => setEditing(e)}
                    className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => hapus(e.id)}
                    className="rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-600"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
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
              onChange={(v) => setEditing({ ...editing, amount: Number(v) || 0 })}
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
              onChange={(e) => setEditing({ ...editing, note: e.target.value })}
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
