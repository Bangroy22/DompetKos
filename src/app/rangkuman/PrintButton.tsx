"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-3 text-sm font-extrabold text-white shadow-md shadow-fuchsia-200 transition active:scale-[0.98]"
    >
      🖨️ Cetak / Simpan PDF
    </button>
  );
}
