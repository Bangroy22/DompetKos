"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/categories";
import { currentMonth, formatRupiah } from "@/lib/format";
import { RupiahInput } from "@/components/RupiahInput";

export function DisplayNameForm({ initial }: { initial: string }) {
  const [nama, setNama] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const router = useRouter();

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setOk(false);
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: nama.trim() || null })
      .eq("id", user.id);
    setSaving(false);
    if (!error) {
      setOk(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={simpan} className="space-y-2">
      <label className="text-xs font-bold text-slate-600">Nama panggilan</label>
      <div className="flex gap-2">
        <input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="cth: Roy"
          maxLength={40}
          className="flex-1 rounded-2xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:border-brand-400"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 px-4 py-2.5 text-sm font-extrabold text-white disabled:opacity-60"
        >
          {saving ? "⏳" : "💾"}
        </button>
      </div>
      {ok && (
        <p className="text-xs font-bold text-emerald-600">
          ✅ Nama tersimpan!
        </p>
      )}
    </form>
  );
}

interface BudgetVal {
  category: string;
  amount: number;
}

export function BudgetForm({ initial }: { initial: BudgetVal[] }) {
  const [total, setTotal] = useState(
    String(initial.find((b) => b.category === "TOTAL")?.amount ?? "")
  );
  const [perCat, setPerCat] = useState<Record<string, string>>(() => {
    const r: Record<string, string> = {};
    for (const c of CATEGORIES) {
      r[c.name] = String(
        initial.find((b) => b.category === c.name)?.amount ?? ""
      );
    }
    return r;
  });
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setOk(false);
    setError(null);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    if (!user) return;

    const month = currentMonth();
    const rows: { user_id: string; month: string; category: string; amount: number }[] = [];
    const t = Number(total) || 0;
    if (t > 0) rows.push({ user_id: user.id, month, category: "TOTAL", amount: t });
    for (const c of CATEGORIES) {
      const v = Number(perCat[c.name]) || 0;
      if (v > 0)
        rows.push({ user_id: user.id, month, category: c.name, amount: v });
    }

    const { error } = await supabase.from("budgets").upsert(rows, {
      onConflict: "user_id,month,category",
    });
    setSaving(false);
    if (error) {
      setError("Gagal menyimpan budget. Coba lagi ya.");
    } else {
      setOk(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={simpan} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-bold text-slate-600">
          💰 Budget total bulan ini (Rp)
        </label>
        <RupiahInput
          value={total}
          onChange={setTotal}
          placeholder="cth: 1.500.000"
          className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-lg font-extrabold outline-none focus:border-brand-400"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold text-slate-600">
          🎯 Budget per kategori{" "}
          <span className="font-medium text-slate-400">(opsional)</span>
        </label>
        <div className="space-y-2">
          {CATEGORIES.map((c) => (
            <div key={c.name} className="flex items-center gap-2">
              <span className="w-28 shrink-0 text-xs font-bold text-slate-600">
                {c.name}
              </span>
              <RupiahInput
                value={perCat[c.name]}
                onChange={(v) => setPerCat({ ...perCat, [c.name]: v })}
                placeholder="0"
                className="flex-1 rounded-xl border-2 border-slate-200 px-3 py-2 text-sm font-bold outline-none focus:border-brand-400"
              />
            </div>
          ))}
        </div>
      </div>
      {error && (
        <p className="text-xs font-bold text-rose-600">⚠️ {error}</p>
      )}
      {ok && (
        <p className="text-xs font-bold text-emerald-600">
          ✅ Budget bulan {currentMonth()} tersimpan! Total:{" "}
          {formatRupiah(Number(total) || 0)}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-600/25 disabled:opacity-60"
      >
        {saving ? "⏳ Menyimpan..." : "💾 Simpan Budget"}
      </button>
    </form>
  );
}

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function keluar() {
    if (!confirm("Yakin mau keluar?")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={keluar}
      disabled={loading}
      className="w-full rounded-2xl border-2 border-rose-200 bg-rose-50 py-3 text-sm font-extrabold text-rose-600 transition active:scale-[0.98] disabled:opacity-60"
    >
      {loading ? "⏳..." : "🚪 Keluar Akun"}
    </button>
  );
}

export function PasswordForm() {
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function simpan(e: React.FormEvent) {
    e.preventDefault();
    setOk(false);
    setError(null);
    if (pw1.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (pw1 !== pw2) {
      setError("Konfirmasi password tidak sama. Cek lagi ya.");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;
      setOk(true);
      setPw1("");
      setPw2("");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Gagal mengubah password. Coba lagi ya."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={simpan} className="space-y-3">
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
          className="w-full rounded-2xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:border-brand-400"
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
          className="w-full rounded-2xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold outline-none focus:border-brand-400"
        />
      </div>
      {error && (
        <p className="text-xs font-bold text-rose-600">⚠️ {error}</p>
      )}
      {ok && (
        <p className="text-xs font-bold text-emerald-600">
          ✅ Password berhasil diubah!
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-600/25 disabled:opacity-60"
      >
        {saving ? "⏳ Menyimpan..." : "🔑 Ubah Password"}
      </button>
    </form>
  );
}
