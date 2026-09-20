import "server-only";
import { prisma } from "@/lib/prisma";
import { isReadyForAdminReview } from "@/lib/access";

export async function getAllUsersWithStats() {
  const [users, totalLessons] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accessStatus: true,
        createdAt: true,
        emailVerified: true,
        _count: {
          select: {
            lessonProgress: { where: { completed: true } },
            achievements: true,
          },
        },
      },
    }),
    prisma.lesson.count(),
  ]);

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    accessStatus: u.accessStatus,
    createdAt: u.createdAt,
    emailVerified: u.emailVerified,
    readyForReview: isReadyForAdminReview(u),
    completedLessons: u._count.lessonProgress,
    totalLessons,
    percent:
      totalLessons === 0 ? 0 : Math.round((u._count.lessonProgress / totalLessons) * 100),
    achievementsCount: u._count.achievements,
  }));
}
