"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { currentMonth, namaBulan } from "@/lib/format";
import {
  DisplayNameForm,
  BudgetForm,
  LogoutButton,
} from "./SettingsForms";
import SetupNotice from "@/components/SetupNotice";

interface Budget {
  category: string;
  amount: number;
}

export default function PengaturanPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "setup" | "ready">("loading");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const month = currentMonth();

  useEffect(() => {
    (async () => {
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        setStatus("setup");
        return;
      }
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user) {
        router.replace("/login");
        return;
      }
      const [{ data: profile }, { data: b }] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single(),
        supabase
          .from("budgets")
          .select("category, amount")
          .eq("user_id", user.id)
          .eq("month", month),
      ]);
      setDisplayName(
        (profile as { display_name?: string } | null)?.display_name ?? ""
      );
      setEmail(user.email ?? "");
      setBudgets(
        (b ?? []).map((x) => ({
          category: x.category,
          amount: Number(x.amount) || 0,
        }))
      );
      setStatus("ready");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading") {
    return (
      <div className="space-y-4" aria-label="Memuat pengaturan">
        <div className="h-8 w-40 animate-pulse rounded-2xl bg-white" />
        <div className="h-36 animate-pulse rounded-3xl bg-white" />
        <div className="h-64 animate-pulse rounded-3xl bg-white" />
        <p className="py-2 text-center text-xs font-bold text-slate-400">
          ⏳ Memuat pengaturan...
        </p>
      </div>
    );
  }
  if (status === "setup") return <SetupNotice />;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold text-slate-800">⚙️ Pengaturan</h2>

      {/* Profil */}
      <section className="space-y-3 rounded-3xl border border-brand-100 bg-white p-4 shadow-lg shadow-brand-600/5">
        <h3 className="text-sm font-extrabold text-slate-800">👤 Profil</h3>
        <DisplayNameForm initial={displayName} />
        <p className="text-xs font-semibold text-slate-400">📧 {email}</p>
      </section>

      {/* Budget */}
      <section className="rounded-3xl border border-brand-100 bg-white p-4 shadow-lg shadow-brand-600/5">
        <h3 className="mb-3 text-sm font-extrabold text-slate-800">
          💰 Budget — {namaBulan(month)}
        </h3>
        <BudgetForm initial={budgets} />
      </section>

      <LogoutButton />

      <p className="pb-4 text-center text-xs text-slate-400">
        DompetKos 💚 — dibuat untuk anak kos Indonesia
        <br />
        <span className="text-[11px] font-semibold">
          Made by <span className="font-extrabold text-slate-500">rhsdigital</span>
        </span>
      </p>
    </div>
  );
}
