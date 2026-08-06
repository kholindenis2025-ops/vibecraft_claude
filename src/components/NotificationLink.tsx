"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markNotificationReadAction } from "@/lib/actions/notification-actions";

export function NotificationLink({
  notificationId,
  href,
  className,
  children,
}: {
  notificationId: string;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    startTransition(async () => {
      await markNotificationReadAction(notificationId);
      router.push(href);
    });
  }

  return (
    <a href={href} className={className} aria-disabled={isPending} onClick={handleClick}>
      {children}
    </a>
  );
}
