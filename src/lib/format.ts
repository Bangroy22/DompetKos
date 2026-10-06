export function formatRupiah(n: number | string | null | undefined): string {
  const num = Number(n) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatTanggal(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Format ribuan ala Indonesia: "200000" → "200.000". Terima digit saja. */
export function formatThousands(digits: string | number | null | undefined): string {
  const d = String(digits ?? "").replace(/\D/g, "");
  if (!d) return "";
  return new Intl.NumberFormat("id-ID").format(Number(d));
}

/** Ambil digit saja dari input: "200.000" → "200000" */
export function parseDigits(v: string): string {
  return v.replace(/\D/g, "");
}
export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Nama bulan Indonesia, mis. '2026-10' → 'Oktober 2026' */
export function namaBulan(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}
