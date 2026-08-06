"use client";

import Link from "next/link";
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
  const [, startTransition] = useTransition();

  return (
    <Link
      href={href}
      className={className}
      onClick={() => startTransition(() => markNotificationReadAction(notificationId))}
    >
      {children}
    </Link>
  );
}
