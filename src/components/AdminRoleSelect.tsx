"use client";

import { useTransition } from "react";
import { adminSetUserRoleAction } from "@/lib/actions/admin-actions";

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Ученик",
  CURATOR: "Куратор",
  ADMIN: "Администратор",
};

export function AdminRoleSelect({ userId, role }: { userId: string; role: string }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    startTransition(async () => {
      await adminSetUserRoleAction(userId, next);
    });
  }

  return (
    <select
      value={role}
      onChange={handleChange}
      disabled={isPending}
      className="input !w-auto !py-1.5 text-xs"
    >
      {Object.entries(ROLE_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
