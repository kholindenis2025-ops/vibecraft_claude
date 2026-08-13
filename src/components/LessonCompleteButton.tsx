"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle, Award } from "lucide-react";
import { setLessonCompleted } from "@/lib/actions/progress-actions";
import { AchievementIcon } from "@/lib/achievement-icons";

type Props = {
  lessonId: string;
  initialCompleted: boolean;
  modulePath: string;
  lessonPath: string;
};

export function LessonCompleteButton({ lessonId, initialCompleted, modulePath, lessonPath }: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();
  const [unlocked, setUnlocked] = useState<{ title: string; icon: string }[]>([]);
  const [error, setError] = useState(false);

  function toggle() {
    const previous = completed;
    const next = !completed;
    setCompleted(next);
    setError(false);
    startTransition(async () => {
      try {
        const result = await setLessonCompleted(lessonId, next, { modulePath, lessonPath });
        if (next && result.unlocked.length > 0) {
          setUnlocked(result.unlocked);
          setTimeout(() => setUnlocked([]), 5000);
        }
      } catch {
        // Save failed server-side — don't let the button silently lie about
        // progress that was never actually persisted.
        setCompleted(previous);
        setError(true);
      }
    });
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        disabled={isPending}
        className={completed ? "btn-primary" : "btn-secondary"}
      >
        {completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        {completed ? "Урок пройден" : "Отметить как пройденный"}
      </button>

      {unlocked.length > 0 && (
        <div className="absolute right-0 top-full z-10 mt-2 w-64 rounded-xl border border-accent/40 bg-card p-3 shadow-lg">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-accent">
            <Award size={14} /> Новое достижение!
          </p>
          {unlocked.map((a) => (
            <p key={a.title} className="flex items-center gap-1.5 text-sm">
              <AchievementIcon iconKey={a.icon} size={14} className="text-accent" /> {a.title}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
