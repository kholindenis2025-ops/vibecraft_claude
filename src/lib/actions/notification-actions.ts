"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function markNotificationReadAction(notificationId: string): Promise<void> {
  const user = await requireUser();

  await prisma.notificationRead.upsert({
    where: { userId_notificationId: { userId: user.id, notificationId } },
    update: {},
    create: { userId: user.id, notificationId },
  });

  revalidatePath("/updates");
}
