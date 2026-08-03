"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { reviewHomeworkAction } from "@/lib/actions/homework-actions";

export function HomeworkReviewForm({ submissionId }: { submissionId: string }) {
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState<"APPROVED" | "REJECTED" | null>(null);

  function review(status: "APPROVED" | "REJECTED") {
    startTransition(async () => {
      await reviewHomeworkAction(submissionId, status, feedback);
      setDone(status);
    });
  }

  if (done) {
    return (
      <p
        className={`flex items-center gap-1.5 text-sm font-semibold ${
          done === "APPROVED" ? "text-accent" : "text-danger"
        }`}
      >
        {done === "APPROVED" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
        {done === "APPROVED" ? "Принято" : "Отклонено"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={2}
        className="input resize-none"
        placeholder="Комментарий (необязательно)"
      />
      <div className="flex gap-2">
        <button
          onClick={() => review("APPROVED")}
          disabled={isPending}
          className="btn-primary flex-1"
        >
          <CheckCircle2 size={16} /> Принять
        </button>
        <button
          onClick={() => review("REJECTED")}
          disabled={isPending}
          className="btn-secondary flex-1"
        >
          <XCircle size={16} /> Вернуть на доработку
        </button>
      </div>
    </div>
  );
}
