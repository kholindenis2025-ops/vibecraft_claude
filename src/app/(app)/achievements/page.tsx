import { Lock } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AchievementIcon } from "@/lib/achievement-icons";

export default async function AchievementsPage() {
  const user = await requireUser();

  const [achievements, userAchievements] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({
      where: { userId: user.id },
      select: { achievementId: true, unlockedAt: true },
    }),
  ]);

  const unlockedMap = new Map(userAchievements.map((u) => [u.achievementId, u.unlockedAt]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="kicker">Достижения</span>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
          {unlockedMap.size} из {achievements.length} открыто
        </h1>
        <p className="mt-1 text-text-muted">Прокачивай навыки и собирай значки по мере прохождения курса.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a) => {
          const unlockedAt = unlockedMap.get(a.id);
          const isUnlocked = Boolean(unlockedAt);
          return (
            <div
              key={a.id}
              className={`card flex items-start gap-4 p-5 ${!isUnlocked ? "opacity-50" : ""}`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  isUnlocked ? "bg-accent-soft text-accent" : "bg-bg-soft"
                }`}
              >
                {isUnlocked ? (
                  <AchievementIcon iconKey={a.icon} size={22} />
                ) : (
                  <Lock size={20} className="text-text-dim" />
                )}
              </span>
              <div className="min-w-0">
                <p className="font-bold">{a.title}</p>
                <p className="text-sm text-text-muted">{a.description}</p>
                {isUnlocked && unlockedAt && (
                  <p className="mt-1 text-xs text-accent">
                    Получено{" "}
                    {new Date(unlockedAt).toLocaleDateString("ru-RU", { timeZone: "Europe/Moscow" })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
