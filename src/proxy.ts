import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const path = request.nextUrl.pathname;
  // Halaman splash (/) boleh dibuka tanpa login; halaman app lainnya diproteksi
  const isAuthRoute =
    path === "/" || path === "/login" || path.startsWith("/auth/");

  // Tanpa konfigurasi Supabase, lewatkan tanpa proteksi route
  // (halaman login akan menampilkan pesan konfigurasi)
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return supabaseResponse;
  }

  let user = null;
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Proteksi route memakai getSession() (baca dari cookie, tanpa request
    // jaringan) agar navigasi antar-halaman tidak delay. Keamanan data tetap
    // dijamin RLS Supabase yang memvalidasi JWT di setiap query.
    const { data } = await supabase.auth.getSession();
    user = data.session?.user ?? null;
  } catch {
    // Supabase tidak terjangkau / key salah → anggap belum login
    user = null;
  }

  // Belum login → lempar ke /login (kecuali halaman auth itu sendiri)
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Sudah login tapi buka /login → lempar ke beranda
  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
