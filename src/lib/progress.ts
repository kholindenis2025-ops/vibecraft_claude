import "server-only";
import { prisma } from "@/lib/prisma";

export async function getModulesWithProgress(userId: string) {
  const modules = await prisma.module.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          slug: true,
          title: true,
          durationMin: true,
          progress: { where: { userId }, select: { completed: true } },
        },
      },
    },
  });

  return modules.map((mod) => {
    const total = mod.lessons.length;
    const completed = mod.lessons.filter((l) => l.progress[0]?.completed).length;
    return {
      id: mod.id,
      slug: mod.slug,
      title: mod.title,
      description: mod.description,
      icon: mod.icon,
      externalUrl: mod.externalUrl,
      order: mod.order,
      totalLessons: total,
      completedLessons: completed,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
      isComplete: total > 0 && completed === total,
      lessons: mod.lessons.map((l) => ({
        id: l.id,
        slug: l.slug,
        title: l.title,
        durationMin: l.durationMin,
        completed: Boolean(l.progress[0]?.completed),
      })),
    };
  });
}

export async function getCourseSummary(userId: string) {
  const modules = await getModulesWithProgress(userId);
  const totalLessons = modules.reduce((sum, m) => sum + m.totalLessons, 0);
  const completedLessons = modules.reduce((sum, m) => sum + m.completedLessons, 0);
  const percent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  const completedModules = modules.filter((m) => m.isComplete).length;

  return { modules, totalLessons, completedLessons, percent, completedModules };
}
