import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SupportForm } from "@/components/SupportForm";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Поддержка — VIBECRAFT",
};

export default async function SupportPage() {
  const user = await getCurrentUser();
  const identity = user ? { name: user.name, email: user.email } : null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href={user ? "/dashboard" : "/"}
          className="mb-8 flex items-center justify-center gap-2 font-extrabold tracking-tight"
        >
          <Logo size={36} />
          VIBE<span className="text-accent">CRAFT</span>
        </Link>
        <div className="card p-6 sm:p-8">
          <h1 className="mb-1 text-xl font-bold">Написать в поддержку</h1>
          <p className="mb-6 text-sm text-text-muted">
            Опиши проблему — письмо уйдёт на support@vibe-craft.ru. Ответить
            можно на вашу почту. В «отправленных» Gmail его не будет.
          </p>
          <SupportForm identity={identity} />
        </div>
      </div>
    </div>
  );
}
