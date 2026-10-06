import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { currentMonth, formatRupiah, namaBulan } from "@/lib/format";
import { CATEGORIES, categoryMeta } from "@/lib/categories";
import DonutChart from "@/components/DonutChart";
import DailyChart from "@/components/DailyChart";
import InsightCard from "@/components/InsightCard";
import SetupNotice from "@/components/SetupNotice";
import SplashScreen from "@/components/SplashScreen";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return <SetupNotice />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <SplashScreen />;

  const month = currentMonth();

  const [{ data: expenses }, { data: budgets }, { data: profile }] =
    await Promise.all([
      supabase
        .from("expenses")
        .select("id, amount, category, spent_at")
        .eq("user_id", user.id)
        .gte("spent_at", `${month}-01`)
        .order("spent_at", { ascending: true }),
      supabase
        .from("budgets")
        .select("category, amount")
        .eq("user_id", user.id)
        .eq("month", month),
      supabase.from("profiles").select("display_name").eq("id", user.id).single(),
    ]);

  const list = (expenses ?? []).map((e) => ({
    ...e,
    amount: Number(e.amount) || 0,
  }));
  const totalSpent = list.reduce((s, e) => s + e.amount, 0);
  const totalBudget = Number(
    (budgets ?? []).find((b) => b.category === "TOTAL")?.amount ?? 0
  );
  const sisa = totalBudget - totalSpent;
  const nama = profile?.display_name || user.email?.split("@")[0] || "Sobat Kos";

  // Donat per kategori
  const perCat = new Map<string, number>();
  for (const e of list) perCat.set(e.category, (perCat.get(e.category) ?? 0) + e.amount);
  const sortedCat = [...perCat.entries()].sort((a, b) => b[1] - a[1]);

  // Grafik harian bulan ini
  const daysInMonth = new Date(
    Number(month.slice(0, 4)),
    Number(month.slice(5, 7)),
    0
  ).getDate();
  const daily = new Array<number>(daysInMonth).fill(0);
  for (const e of list) {
    const d = Number(e.spent_at.slice(8, 10));
    if (d >= 1 && d <= daysInMonth) daily[d - 1] += e.amount;
  }

  // Budget per kategori + progress
  const budgetRows = (budgets ?? [])
    .filter((b) => b.category !== "TOTAL")
    .map((b) => {
      const spent = perCat.get(b.category) ?? 0;
      const amt = Number(b.amount) || 0;
      return { ...b, amount: amt, spent, pct: amt > 0 ? (spent / amt) * 100 : 0 };
    });

  const sapaan = sapaanWaktu();
  const overBudget = totalBudget > 0 && sisa < 0;

  return (
    <div className="space-y-4">
      {/* Sapaan */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {sapaan}, {nama}! 👋
          </p>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-800">
            {namaBulan(month)}
          </h2>
          <p className="text-[10px] font-semibold tracking-wide text-slate-400">
            Made by rhsdigital
          </p>
        </div>
        <Link
          href="/catat"
          className="rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-brand-600/25 transition active:scale-95"
        >
          ➕ Catat
        </Link>
      </div>

      {/* Kartu sisa uang */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-600 to-brand-500 p-5 text-white shadow-xl shadow-brand-600/25 ring-1 ring-gold-300/40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/10" />
          <div className="absolute right-16 top-8 h-10 w-10 rounded-full bg-gold-400/30" />
        </div>
        <p className="relative text-xs font-bold uppercase tracking-wider text-white/80">
          💸 Sisa uang bulan ini
        </p>
        <p
          className={`relative mt-1 text-4xl font-extrabold tracking-tight ${
            overBudget ? "text-glow-400" : ""
          }`}
        >
          {totalBudget > 0 ? formatRupiah(sisa) : "—"}
        </p>
        <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-white/20">
          <div
            className={`h-full rounded-full transition-all ${
              overBudget
                ? "bg-gold-400"
                : "bg-gradient-to-r from-gold-500 via-gold-300 to-gold-400"
            }`}
            style={{
              width: totalBudget > 0 ? `${Math.min((totalSpent / totalBudget) * 100, 100)}%` : "0%",
            }}
          />
        </div>
        <p className="relative mt-2 text-xs font-semibold text-white/85">
          {totalBudget > 0 ? (
            <>
              Terpakai {formatRupiah(totalSpent)} dari budget{" "}
              {formatRupiah(totalBudget)}
            </>
          ) : (
            <>
              Kamu sudah mengeluarkan {formatRupiah(totalSpent)} bulan ini.{" "}
              <Link href="/pengaturan" className="font-extrabold underline">
                Atur budget yuk →
              </Link>
            </>
          )}
        </p>
      </section>

      {list.length === 0 ? (
        <section className="rounded-3xl border-2 border-dashed border-brand-200 bg-white/70 p-6 text-center">
          <p className="text-4xl">📝</p>
          <p className="mt-2 text-sm font-extrabold text-slate-700">
            Belum ada pengeluaran bulan ini
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Catat pengeluaran pertamamu — cuma butuh 10 detik!
          </p>
          <Link
            href="/catat"
            className="mt-3 inline-block rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 px-6 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-brand-600/25"
          >
            ➕ Catat Sekarang
          </Link>
        </section>
      ) : (
        <>
          {/* Donat kategori */}
          <section className="rounded-3xl border border-brand-100 bg-white p-4 shadow-lg shadow-brand-600/5">
            <h2 className="mb-2 text-sm font-extrabold text-slate-800">
              🍩 Pengeluaran per Kategori
            </h2>
            <div className="mx-auto max-w-[280px]">
              <DonutChart
                labels={sortedCat.map(([c]) => c)}
                values={sortedCat.map(([, v]) => v)}
                colors={sortedCat.map(([c]) => categoryMeta(c).color)}
              />
            </div>
          </section>

          {/* Grafik harian */}
          <section className="rounded-3xl border border-brand-100 bg-white p-4 shadow-lg shadow-brand-600/5">
            <h2 className="mb-2 text-sm font-extrabold text-slate-800">
              📈 Pengeluaran Harian
            </h2>
            <DailyChart
              labels={daily.map((_, i) => String(i + 1))}
              values={daily}
            />
          </section>
        </>
      )}

      {/* Budget per kategori */}
      {budgetRows.length > 0 && (
        <section className="rounded-3xl border border-brand-100 bg-white p-4 shadow-lg shadow-brand-600/5">
          <h2 className="mb-3 text-sm font-extrabold text-slate-800">
            🎯 Budget per Kategori
          </h2>
          <div className="space-y-3">
            {budgetRows.map((b) => {
              const meta = categoryMeta(b.category);
              const bahaya = b.pct >= 80;
              return (
                <div key={b.category}>
                  <div className="mb-1 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">
                      {meta.emoji} {b.category}
                    </span>
                    <span className={bahaya ? "text-amber-600" : "text-slate-500"}>
                      {formatRupiah(b.spent)} / {formatRupiah(b.amount)}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-brand-50">
                    <div
                      className={`h-full rounded-full transition-all ${
                        bahaya
                          ? "bg-gradient-to-r from-amber-500 to-coral-400"
                          : "bg-gradient-to-r from-brand-600 to-brand-400"
                      }`}
                      style={{ width: `${Math.min(b.pct, 100)}%` }}
                    />
                  </div>
                  {bahaya && (
                    <p className="mt-0.5 text-[11px] font-bold text-amber-600">
                      ⚠️ Udah {Math.round(b.pct)}% — rem dikit!
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Insight AI */}
      <InsightCard />

      {/* Kategori cepat */}
      <section>
        <h2 className="mb-2 text-sm font-extrabold text-slate-800">
          ⚡ Catat Kilat
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              href={`/catat?kategori=${encodeURIComponent(c.name)}`}
              className="rounded-2xl border border-brand-100 bg-white p-3 text-center shadow-sm transition hover:shadow-md active:scale-95"
            >
              <span
                className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl text-xl"
                style={{ backgroundColor: c.color + "22" }}
              >
                {c.emoji}
              </span>
              <p className="mt-1.5 text-[11px] font-extrabold text-slate-700">
                {c.name}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function sapaanWaktu(): string {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}
