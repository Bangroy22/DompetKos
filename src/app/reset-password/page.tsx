import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-3xl bg-white p-6 text-center text-sm font-bold text-slate-500">
          ⏳ Memuat...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
