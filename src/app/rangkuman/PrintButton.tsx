"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print w-full rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-600/25 transition active:scale-[0.98]"
    >
      🖨️ Cetak / Simpan PDF
    </button>
  );
}
