"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { currentMonth, formatRupiah, formatTanggal, namaBulan } from "@/lib/format";
import { categoryMeta } from "@/lib/categories";
import DonutChart from "@/components/DonutChart";
import InsightCard from "@/components/InsightCard";
import PrintButton from "./PrintButton";
import SetupNotice from "@/components/SetupNotice";

interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  spent_at: string;
}

interface Budget {
  category: string;
  amount: number;
}

export default function RangkumanPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "setup" | "ready">("loading");
  const [list, setList] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [nama, setNama] = useState("Sobat Kos");
  const month = currentMonth();

  useEffect(() => {
    (async () => {
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        setStatus("setup");
        return;
      }
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user) {
        router.replace("/login");
        return;
      }
      const [{ data: e }, { data: b }, { data: p }] = await Promise.all([
        supabase
          .from("expenses")
          .select("id, amount, category, note, spent_at")
          .eq("user_id", user.id)
          .gte("spent_at", `${month}-01`)
          .order("amount", { ascending: false }),
        supabase
          .from("budgets")
          .select("category, amount")
          .eq("user_id", user.id)
          .eq("month", month),
        supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single(),
      ]);
      setList(
        (e ?? []).map((x) => ({ ...x, amount: Number(x.amount) || 0 }))
      );
      setBudgets(
        (b ?? []).map((x) => ({
          category: x.category,
          amount: Number(x.amount) || 0,
        }))
      );
      setNama(
        (p as { display_name?: string } | null)?.display_name ||
          user.email?.split("@")[0] ||
          "Sobat Kos"
      );
      setStatus("ready");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading") {
    return (
      <div className="space-y-4" aria-label="Memuat rangkuman">
        <div className="h-8 w-48 animate-pulse rounded-2xl bg-white" />
        <div className="h-64 animate-pulse rounded-3xl bg-white" />
        <p className="py-2 text-center text-xs font-bold text-slate-400">
          ⏳ Memuat rangkuman...
        </p>
      </div>
    );
  }
  if (status === "setup") return <SetupNotice />;

  const total = list.reduce((s, e) => s + e.amount, 0);
  const totalBudget = Number(
    budgets.find((b) => b.category === "TOTAL")?.amount ?? 0
  );
  const sisa = totalBudget - total;

  const perCat = new Map<string, number>();
  for (const e of list) perCat.set(e.category, (perCat.get(e.category) ?? 0) + e.amount);
  const sortedCat = [...perCat.entries()].sort((a, b) => b[1] - a[1]);
  const top5 = [...list]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="no-print flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-slate-800">
          📊 Rangkuman Bulanan
        </h2>
      </div>

      {/* ===== Area cetak ===== */}
      <div className="print-area space-y-4 rounded-3xl border border-brand-100 bg-white p-5 shadow-lg shadow-brand-600/5">
        <div className="border-b-2 border-dashed border-brand-200 pb-3 text-center">
          <p className="text-lg font-extrabold text-slate-800">
            💰 DompetKos
          </p>
          <p className="text-sm font-bold text-slate-500">
            Rangkuman {namaBulan(month)} — {nama}
          </p>
        </div>

        {/* Total vs budget */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-brand-50 p-3">
            <p className="text-[10px] font-bold uppercase text-slate-500">
              Pengeluaran
            </p>
            <p className="text-sm font-extrabold text-brand-700">
              {formatRupiah(total)}
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-3">
            <p className="text-[10px] font-bold uppercase text-slate-500">
              Budget
            </p>
            <p className="text-sm font-extrabold text-amber-700">
              {totalBudget > 0 ? formatRupiah(totalBudget) : "—"}
            </p>
          </div>
          <div
            className={`rounded-2xl p-3 ${
              sisa < 0 ? "bg-rose-50" : "bg-emerald-50"
            }`}
          >
            <p className="text-[10px] font-bold uppercase text-slate-500">
              Sisa
            </p>
            <p
              className={`text-sm font-extrabold ${
                sisa < 0 ? "text-rose-600" : "text-emerald-700"
              }`}
            >
              {totalBudget > 0 ? formatRupiah(sisa) : "—"}
            </p>
          </div>
        </div>

        {list.length === 0 ? (
          <p className="py-6 text-center text-sm font-semibold text-slate-400">
            📝 Belum ada pengeluaran bulan ini. Rangkuman akan terisi otomatis
            setelah kamu mencatat pengeluaran.
          </p>
        ) : (
          <>
            {/* Tabel per kategori */}
            <div>
              <h3 className="mb-2 text-sm font-extrabold text-slate-800">
                📋 Per Kategori
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase text-slate-400">
                    <th className="pb-2 font-bold">Kategori</th>
                    <th className="pb-2 text-right font-bold">Total</th>
                    <th className="pb-2 text-right font-bold">Porsi</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCat.map(([c, v]) => {
                    const meta = categoryMeta(c);
                    return (
                      <tr
                        key={c}
                        className="border-t border-slate-100 font-semibold text-slate-700"
                      >
                        <td className="py-2">
                          {meta.emoji} {c}
                        </td>
                        <td className="py-2 text-right">{formatRupiah(v)}</td>
                        <td className="py-2 text-right text-slate-400">
                          {total > 0 ? Math.round((v / total) * 100) : 0}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Grafik */}
            <div className="no-print mx-auto max-w-[280px]">
              <DonutChart
                labels={sortedCat.map(([c]) => c)}
                values={sortedCat.map(([, v]) => v)}
                colors={sortedCat.map(([c]) => categoryMeta(c).color)}
              />
            </div>

            {/* 5 terbesar */}
            <div>
              <h3 className="mb-2 text-sm font-extrabold text-slate-800">
                🔥 5 Pengeluaran Terbesar
              </h3>
              <ol className="space-y-1.5">
                {top5.map((e, i) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="font-bold text-slate-700">
                      <span className="mr-2 text-slate-400">#{i + 1}</span>
                      {categoryMeta(e.category).emoji} {e.note || e.category}
                      <span className="ml-2 text-[11px] font-semibold text-slate-400">
                        {formatTanggal(e.spent_at)}
                      </span>
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {formatRupiah(e.amount)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Insight interaktif */}
            <div className="no-print">
              <InsightCard />
            </div>
          </>
        )}

        <p className="pt-2 text-center text-[10px] text-slate-400">
          Dibuat dengan 💚 oleh DompetKos •{" "}
          {new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <PrintButton />
      <p className="no-print text-center text-xs text-slate-400">
        Pencet tombolnya, lalu pilih “Save as PDF” di dialog print HP/laptopmu 🖨️
      </p>
    </div>
  );
}
