"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Beranda", emoji: "🏠" },
  { href: "/riwayat", label: "Riwayat", emoji: "🧾" },
  { href: "/catat", label: "Catat", emoji: "➕", fab: true },
  { href: "/rangkuman", label: "Rangkuman", emoji: "📊" },
  { href: "/pengaturan", label: "Atur", emoji: "⚙️" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Sembunyikan di halaman login & callback auth
  if (pathname === "/login" || pathname.startsWith("/auth/")) return null;

  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-brand-100 bg-white/95 shadow-[0_-8px_24px_rgba(13,148,136,0.08)] backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2">
        {ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          if (item.fab) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 pb-2"
                aria-label="Catat pengeluaran"
              >
                <span className="flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-500 text-2xl text-white shadow-xl shadow-brand-600/40 ring-4 ring-white transition active:scale-95">
                  {item.emoji}
                </span>
                <span
                  className={`-mt-2 text-[11px] font-extrabold ${
                    active ? "text-brand-700" : "text-slate-400"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold transition ${
                active ? "text-brand-700" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span
                className={`flex h-9 w-12 items-center justify-center rounded-2xl text-lg transition ${
                  active ? "bg-brand-100" : ""
                }`}
              >
                {item.emoji}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)] bg-white/95" />
    </nav>
  );
}
