import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildMonthSummary,
  localInsight,
  type ExpenseRow,
  type BudgetRow,
} from "@/lib/insight";
import { currentMonth } from "@/lib/format";

const GEMINI_MODEL = "gemini-3.8-flash";

export async function POST() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json(
      { error: "Supabase belum dikonfigurasi (cek .env.local)" },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  const month = currentMonth();
  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, amount, category, note, spent_at")
    .eq("user_id", user.id)
    .gte("spent_at", `${month}-01`)
    .lt("spent_at", `${nextMonth(month)}-01`)
    .order("spent_at", { ascending: false });

  const { data: budgets } = await supabase
    .from("budgets")
    .select("category, amount")
    .eq("user_id", user.id)
    .eq("month", month);

  const exp = (expenses ?? []) as ExpenseRow[];
  const bud = (budgets ?? []) as BudgetRow[];

  // Coba Gemini — key HANYA dipakai di server, tidak pernah ke browser
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const summary = buildMonthSummary(exp, bud, month);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text:
                      "Kamu adalah asisten keuangan yang ramah untuk mahasiswa Indonesia. " +
                      "Berdasarkan ringkasan pengeluaran berikut, berikan 2-3 kalimat insight santai dalam Bahasa Indonesia " +
                      "tentang pola pengeluarannya, lalu 1 saran hemat yang konkret dan realistis untuk anak kos. " +
                      "Jangan pakai format markdown yang berat, cukup teks santai dengan 1-2 emoji.\n\n" +
                      summary,
                  },
                ],
              },
            ],
            generationConfig: { temperature: 0.8, maxOutputTokens: 400 },
          }),
        }
      );
      if (res.ok) {
        const json = await res.json();
        const text: string | undefined =
          json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          return NextResponse.json({ insight: text, source: "gemini" });
        }
      }
    } catch {
      // Gagal → fallback ke analisis lokal di bawah
    }
  }

  return NextResponse.json({
    insight: localInsight(exp, bud, month),
    source: "lokal",
  });
}

function nextMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m, 1); // bulan m (0-indexed m) = bulan berikutnya
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
