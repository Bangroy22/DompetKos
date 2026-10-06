import { formatRupiah, namaBulan } from "./format";
import { categoryMeta } from "./categories";

export interface ExpenseRow {
  id: string;
  amount: number | string;
  category: string;
  note: string | null;
  spent_at: string;
}

export interface BudgetRow {
  category: string;
  amount: number | string;
}

function toNum(n: number | string | null | undefined): number {
  return Number(n) || 0;
}

/** Ringkasan data bulan ini dalam bentuk teks — dikirim ke Gemini. */
export function buildMonthSummary(
  expenses: ExpenseRow[],
  budgets: BudgetRow[],
  month: string
): string {
  const total = expenses.reduce((s, e) => s + toNum(e.amount), 0);
  const perCat = new Map<string, number>();
  for (const e of expenses) {
    perCat.set(e.category, (perCat.get(e.category) ?? 0) + toNum(e.amount));
  }
  const totalBudget =
    budgets.find((b) => b.category === "TOTAL")?.amount ?? null;

  const lines = [
    `Bulan: ${namaBulan(month)}`,
    `Total pengeluaran: ${formatRupiah(total)} dari ${expenses.length} transaksi.`,
  ];
  if (totalBudget !== null) {
    lines.push(`Budget total bulan ini: ${formatRupiah(totalBudget)}.`);
  }
  lines.push("Rincian per kategori:");
  for (const [cat, amt] of [...perCat.entries()].sort((a, b) => b[1] - a[1])) {
    const pct = total > 0 ? Math.round((amt / total) * 100) : 0;
    const b = budgets.find((x) => x.category === cat);
    lines.push(
      `- ${cat}: ${formatRupiah(amt)} (${pct}%)` +
        (b ? `, budget ${formatRupiah(b.amount)}` : "")
    );
  }
  const top = [...expenses].sort((a, b) => toNum(b.amount) - toNum(a.amount)).slice(0, 3);
  if (top.length > 0) {
    lines.push("Pengeluaran terbesar:");
    for (const e of top) {
      lines.push(
        `- ${formatRupiah(e.amount)} untuk ${e.category}${e.note ? ` (${e.note})` : ""} pada ${e.spent_at}`
      );
    }
  }
  return lines.join("\n");
}

/** Insight lokal berbasis aturan — dipakai kalau GEMINI_API_KEY belum diset. */
export function localInsight(
  expenses: ExpenseRow[],
  budgets: BudgetRow[],
  month: string
): string {
  if (expenses.length === 0) {
    return (
      `Belum ada pengeluaran yang tercatat di ${namaBulan(month)}. ` +
      "Yuk mulai catat pengeluaran harianmu — cukup 10 detik per transaksi — biar polanya kebaca dan DompetKos bisa kasih saran hemat yang pas buat kamu. 💪"
    );
  }

  const total = expenses.reduce((s, e) => s + toNum(e.amount), 0);
  const perCat = new Map<string, number>();
  for (const e of expenses) {
    perCat.set(e.category, (perCat.get(e.category) ?? 0) + toNum(e.amount));
  }
  const sorted = [...perCat.entries()].sort((a, b) => b[1] - a[1]);
  const [topCat, topAmt] = sorted[0];
  const pct = total > 0 ? Math.round((topAmt / total) * 100) : 0;
  const meta = categoryMeta(topCat);

  const parts: string[] = [];
  parts.push(
    `Bulan ini kamu sudah mengeluarkan ${formatRupiah(total)} dalam ${expenses.length} transaksi. ` +
      `Kategori paling boros: ${meta.emoji} ${topCat} sebesar ${formatRupiah(topAmt)} (${pct}% dari total).`
  );

  const totalBudget = toNum(
    budgets.find((b) => b.category === "TOTAL")?.amount
  );
  if (totalBudget > 0) {
    const used = Math.round((total / totalBudget) * 100);
    if (used >= 100) {
      parts.push(
        `Budget ${formatRupiah(totalBudget)} sudah jebol (${used}% terpakai)! Waktunya mode hemat sampai akhir bulan. 🛑`
      );
    } else if (used >= 80) {
      parts.push(
        `Budget sudah terpakai ${used}% — sisa ${formatRupiah(totalBudget - total)}. Rem sedikit ya! ⚠️`
      );
    } else {
      parts.push(
        `Budget baru terpakai ${used}%, masih aman. Sisa ${formatRupiah(totalBudget - total)} buat sampai akhir bulan. ✅`
      );
    }
  }

  // Saran hemat berdasarkan kategori terbesar
  const saran: Record<string, string> = {
    "Makan":
      "Coba masak 2–3 kali seminggu atau cari warteg langganan — biasanya bisa pangkas 20–30% budget makan.",
    "Kopi/Jajan":
      "Kurangi 1 gelas kopi kekinian per minggu dan ganti kopi sachet — hematnya bisa sampai Rp150rb sebulan!",
    "Transport":
      "Kalau jaraknya dekat, jalan kaki atau nebeng teman bisa motong ongkos harian lumayan.",
    "Hiburan":
      "Tetapkan 'jatah hiburan' mingguan biar nggak kebablasan — misal maksimal Rp50rb per minggu.",
    "Kos": "Cek lagi langganan yang nempel di kos (wifi, streaming) — yang jarang dipakai, stop aja.",
    "Lainnya":
      "Kategori Lainnya gede biasanya tanda banyak pengeluaran impulsif. Catat niat beli 24 jam sebelum checkout!",
  };
  parts.push(`💡 Saran hemat: ${saran[topCat] ?? saran["Lainnya"]}`);

  return parts.join(" ");
}
