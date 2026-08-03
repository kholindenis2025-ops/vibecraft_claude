import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-extrabold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-contrast">
            ⚡
          </span>
          VIBE<span className="text-accent">CRAFT</span>
        </Link>
        <div className="card p-6 sm:p-8">
          <h1 className="mb-1 text-xl font-bold">С возвращением</h1>
          <p className="mb-6 text-sm text-text-muted">Войди, чтобы продолжить обучение.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
