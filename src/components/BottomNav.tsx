"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Beranda", emoji: "🏠" },
  { href: "/catat", label: "Catat", emoji: "➕" },
  { href: "/riwayat", label: "Riwayat", emoji: "🧾" },
  { href: "/rangkuman", label: "Rangkuman", emoji: "📊" },
  { href: "/pengaturan", label: "Pengaturan", emoji: "⚙️" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Sembunyikan di halaman login & callback auth
  if (pathname === "/login" || pathname.startsWith("/auth/")) return null;

  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t-2 border-fuchsia-100 bg-white/95 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold transition ${
                active ? "text-fuchsia-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span
                className={`flex h-9 w-12 items-center justify-center rounded-2xl text-lg transition ${
                  active ? "bg-gradient-to-br from-fuchsia-100 to-orange-100" : ""
                } ${item.href === "/catat" && !active ? "bg-slate-100" : ""}`}
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
