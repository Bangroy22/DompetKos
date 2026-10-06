export default function SetupNotice() {
  return (
    <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-amber-50 p-6 text-center">
      <p className="text-4xl">🔧</p>
      <p className="mt-2 text-sm font-extrabold text-amber-800">
        Supabase belum dikonfigurasi
      </p>
      <p className="mt-1 text-xs leading-relaxed text-amber-700">
        Salin <code className="font-bold">.env.example</code> menjadi{" "}
        <code className="font-bold">.env.local</code> lalu isi{" "}
        <code className="font-bold">NEXT_PUBLIC_SUPABASE_URL</code> dan{" "}
        <code className="font-bold">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dari
        dashboard Supabase-mu. Panduannya ada di README. 📖
      </p>
    </div>
  );
}
