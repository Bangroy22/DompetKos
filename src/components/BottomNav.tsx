"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function Icon({ className = "h-6 w-6", children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const HomeIcon = (
  <Icon>
    <path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12" />
    <path d="M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
  </Icon>
);

const ReceiptIcon = (
  <Icon>
    <path d="M7 3h10a1 1 0 0 1 1 1v16l-2.6-1.7-2.4 1.7-2.4-1.7L8 20l-2-1.3V4a1 1 0 0 1 1-1Z" />
    <path d="M9.5 8h5M9.5 12h5" />
  </Icon>
);

const ChartIcon = (
  <Icon>
    <path d="M3 20h18" />
    <path d="M6.5 20v-6M12 20V6M17.5 20v-9" />
  </Icon>
);

const GearIcon = (
  <Icon>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </Icon>
);

const PlusIcon = (
  <Icon className="h-7 w-7">
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

const ITEMS: { href: string; label: string; icon: ReactNode; fab?: boolean }[] = [
  { href: "/", label: "Beranda", icon: HomeIcon },
  { href: "/riwayat", label: "Riwayat", icon: ReceiptIcon },
  { href: "/catat", label: "Catat", icon: PlusIcon, fab: true },
  { href: "/rangkuman", label: "Rangkuman", icon: ChartIcon },
  { href: "/pengaturan", label: "Atur", icon: GearIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Sembunyikan di halaman login & callback auth
  if (pathname === "/login" || pathname.startsWith("/auth/")) return null;

  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-brand-100 bg-white/95 shadow-[0_-8px_24px_rgba(5,150,105,0.10)] backdrop-blur">
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
                <span className="flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full bg-gradient-to-br from-brand-700 to-brand-500 text-white shadow-xl shadow-brand-600/40 ring-4 ring-gold-300 transition active:scale-95">
                  {item.icon}
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
                className={`flex h-9 w-12 items-center justify-center rounded-2xl transition ${
                  active ? "bg-brand-100" : ""
                }`}
              >
                {item.icon}
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
