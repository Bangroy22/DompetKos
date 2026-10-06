import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-3xl bg-white p-6 text-center text-sm font-bold text-slate-500">
          ⏳ Memuat...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
