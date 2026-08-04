import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      emailVerified: true,
    },
  });

  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

// Curators and admins can review homework and view the student roster.
// Only admins can manage accounts (passwords, roles, deletion).
export async function requireStaff() {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "CURATOR") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
