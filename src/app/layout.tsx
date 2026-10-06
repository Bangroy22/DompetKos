import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "DompetKos — Catat Pengeluaran Anak Kos",
  description:
    "Aplikasi pencatat pengeluaran buat anak kos & mahasiswa, lengkap dengan budget dan insight AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-dvh antialiased">
        {/* Header — nama DompetKos selalu tampil */}
        <header className="no-print sticky top-0 z-40 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 shadow-lg shadow-fuchsia-200">
          <div className="mx-auto flex max-w-md items-center gap-2 px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-xl shadow">
              💰
            </span>
            <div className="leading-tight">
              <h1 className="text-lg font-extrabold tracking-tight text-white">
                DompetKos
              </h1>
              <p className="text-[11px] font-medium text-white/85">
                Kawan setia uang jajanmu 🎓
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-md px-4 pb-28 pt-4">
          {children}
        </main>

        <BottomNav />
      </body>
    </html>
  );
}
