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
      `Dompet masih perawan nih di ${namaBulan(month)} — belum ada pengeluaran tercatat sama sekali. ` +
      "Catat pengeluaranmu, cukup 10 detik per transaksi. Biar nanti polanya bisa dibaca dan dompetmu bisa diroasting dengan data yang valid. 😎"
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
    `Bulan ini dompetmu sudah berkurang ${formatRupiah(total)} dalam ${expenses.length} transaksi. ` +
      `Tersangka utama: ${meta.emoji} ${topCat} — nyedot ${formatRupiah(topAmt)} alias ${pct}% dari total. Dia nih yang wajib diinterogasi. 🕵️`
  );

  const totalBudget = toNum(
    budgets.find((b) => b.category === "TOTAL")?.amount
  );
  if (totalBudget > 0) {
    const used = Math.round((total / totalBudget) * 100);
    if (used >= 100) {
      parts.push(
        `Budget ${formatRupiah(totalBudget)} resmi DINYATAKAN JEBOL (${used}% terpakai)! Sisa bulan ini mode bertahan hidup: mie instan sahabat, nongkrong musuh. 🛑`
      );
    } else if (used >= 80) {
      parts.push(
        `Budget udah kepake ${used}% — sisa ${formatRupiah(totalBudget - total)}. Ibarat bensin, ini udah nyala lampu merah. Rem dikit, masih bisa selamat! ⚠️`
      );
    } else {
      parts.push(
        `Budget baru kepake ${used}%, masih ijo! Sisa ${formatRupiah(totalBudget - total)} buat sampai akhir bulan. Pertahankan, calon sultan kos. ✅`
      );
    }
  }

  // Saran hemat berdasarkan kategori terbesar
  const saran: Record<string, string> = {
    "Makan":
      "Masak 2–3 kali seminggu atau cari warteg langganan — perut kenyang, dompet nggak nangis. Potensi pangkas 20–30%!",
    "Kopi/Jajan":
      "Skip 1 kopi kekinian seminggu, ganti kopi sachet. Lidah mungkin protes, tapi dompet tepuk tangan — bisa hemat sampai Rp150rb sebulan!",
    "Transport":
      "Jarak dekat? Jalan kaki sekalian olahraga, atau nebeng teman sekalian nambah pahala. Ongkos langsung kepangkas.",
    "Hiburan":
      "Kasih 'jatah hiburan' mingguan, misal maksimal Rp50rb. Hiburan boleh, yang penting dompet nggak ikut terhibur sampai kosong.",
    "Kos": "Audit langganan kosan (wifi, streaming). Yang jarang dipakai itu sumbangan sukarela ke perusahaan — stop aja!",
    "Lainnya":
      "Kategori Lainnya gede = banyak checkout impulsif. Terapkan aturan 24 jam: pengen beli? Tunggu besok. 90% keinginan hilang sendiri.",
  };
  parts.push(`💡 Saran serius (tapi santai): ${saran[topCat] ?? saran["Lainnya"]}`);

  return parts.join(" ");
}
