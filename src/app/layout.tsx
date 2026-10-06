import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { LogoMark } from "@/components/Logo";

export const metadata: Metadata = {
  title: "DompetKos — Catat Pengeluaran Anak Kos",
  description:
    "Aplikasi pencatat pengeluaran buat anak kos & mahasiswa, lengkap dengan budget dan insight AI.",
  themeColor: "#047857",
  appleWebApp: {
    capable: true,
    title: "DompetKos",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
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
        <header className="no-print sticky top-0 z-40 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 shadow-lg shadow-brand-600/20">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -left-6 bottom-0 h-20 w-20 translate-y-1/2 rounded-full bg-white/10" />
          </div>
          <div className="relative mx-auto flex max-w-md items-center gap-2.5 px-4 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-md">
              <LogoMark className="h-7 w-7" />
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
