"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Task } from "@/db/schema";

export default function TaskItem({
  task,
  showDate,
}: {
  task: Task;
  showDate?: string;
}) {
  const router = useRouter();
  const [done, setDone] = useState(task.done);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    const next = !done;
    setDone(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: next }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setDone(!next);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <li
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-ink-800/70 ${
        done ? "task-done" : ""
      }`}
    >
      <button
        onClick={toggle}
        disabled={busy}
        aria-label={done ? "Mark as not done" : "Mark as done"}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
          done
            ? "border-sage-400 bg-sage-400/20 text-sage-400"
            : "border-ink-400 text-transparent hover:border-ember-400"
        }`}
      >
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6.5L5 9l4.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="min-w-0 flex-1 font-body text-[17px] leading-snug text-cream-100">
        <span className="task-title">{task.title}</span>
      </span>
      {showDate && (
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-400">
          {showDate}
        </span>
      )}
      <button
        onClick={remove}
        disabled={busy}
        aria-label="Delete task"
        className="shrink-0 text-ink-600 opacity-0 transition-opacity hover:text-red-400/80 group-hover:opacity-100"
      >
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </li>
  );
}
