import { NextResponse } from "next/server";

// Status publik aplikasi (tanpa data sensitif)
export async function GET() {
  return NextResponse.json({
    gemini: Boolean(process.env.GEMINI_API_KEY),
  });
}
