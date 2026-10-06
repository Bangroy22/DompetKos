import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { currentMonth, namaBulan } from "@/lib/format";
import {
  DisplayNameForm,
  BudgetForm,
  LogoutButton,
} from "./SettingsForms";
import SetupNotice from "@/components/SetupNotice";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return <SetupNotice />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const month = currentMonth();
  const [{ data: profile }, { data: budgets }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).single(),
    supabase
      .from("budgets")
      .select("category, amount")
      .eq("user_id", user.id)
      .eq("month", month),
  ]);

  const geminiAktif = Boolean(process.env.GEMINI_API_KEY);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold text-slate-800">⚙️ Pengaturan</h2>

      {/* Profil */}
      <section className="space-y-3 rounded-3xl border border-brand-100 bg-white p-4 shadow-lg shadow-brand-600/5">
        <h3 className="text-sm font-extrabold text-slate-800">👤 Profil</h3>
        <DisplayNameForm initial={profile?.display_name ?? ""} />
        <p className="text-xs font-semibold text-slate-400">📧 {user.email}</p>
      </section>

      {/* Budget */}
      <section className="rounded-3xl border border-brand-100 bg-white p-4 shadow-lg shadow-brand-600/5">
        <h3 className="mb-3 text-sm font-extrabold text-slate-800">
          💰 Budget — {namaBulan(month)}
        </h3>
        <BudgetForm
          initial={(budgets ?? []).map((b) => ({
            category: b.category,
            amount: Number(b.amount) || 0,
          }))}
        />
      </section>

      {/* Status AI */}
      <section className="rounded-3xl border border-brand-100 bg-white p-4 shadow-lg shadow-brand-600/5">
        <h3 className="mb-2 text-sm font-extrabold text-slate-800">
          🤖 Koneksi Gemini AI
        </h3>
        <div
          className={`flex items-center gap-3 rounded-2xl p-3 ${
            geminiAktif ? "bg-emerald-50" : "bg-amber-50"
          }`}
        >
          <span className="text-2xl">{geminiAktif ? "✅" : "⚠️"}</span>
          <div>
            <p
              className={`text-sm font-extrabold ${
                geminiAktif ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {geminiAktif ? "Terhubung" : "Belum terhubung"}
            </p>
            <p className="text-xs text-slate-500">
              {geminiAktif
                ? "Insight AI memakai Gemini AI asli ✨"
                : "Isi GEMINI_API_KEY di env agar insight memakai AI asli. Sementara ini memakai analisis lokal bawaan."}
            </p>
          </div>
        </div>
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
