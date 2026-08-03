import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "@/components/RegisterForm";
import { Logo } from "@/components/Logo";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-extrabold tracking-tight">
          <Logo size={36} />
          VIBE<span className="text-accent">CRAFT</span>
        </Link>
        <div className="card p-6 sm:p-8">
          <h1 className="mb-1 text-xl font-bold">Создать аккаунт</h1>
          <p className="mb-6 text-sm text-text-muted">
            Начни путь от нуля до своего первого продукта на ИИ.
          </p>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
