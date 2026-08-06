import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.emailVerified) {
    redirect("/verify-email");
  }

  const unreadCount = await prisma.notification.count({
    where: { reads: { none: { userId: user.id } } },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={user} unreadCount={unreadCount} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
