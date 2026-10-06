import { Suspense } from "react";
import CatatForm from "./CatatForm";

export default function CatatPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-3xl bg-white p-6 text-center text-sm font-bold text-slate-500">
          ⏳ Memuat...
        </div>
      }
    >
      <CatatForm />
    </Suspense>
  );
}
