"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Task, Project } from "@/db/schema";

export default function TaskItem({
  task,
  showDate,
  projects,
  hideProjectTag,
}: {
  task: Task;
  showDate?: string;
  projects?: Pick<Project, "id" | "name" | "color">[];
  hideProjectTag?: boolean;
}) {
  const router = useRouter();
  const [done, setDone] = useState(task.done);
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);

  const project = projects?.find((p) => p.id === task.projectId);

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

  async function assign(projectId: number | null) {
    setPicking(false);
    setBusy(true);
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      router.refresh();
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
      className={`group flex flex-wrap items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-ink-800/70 ${
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

      {/* Project tag / picker */}
      {projects && !hideProjectTag && (
        <span className="relative shrink-0">
          <button
            onClick={() => setPicking((v) => !v)}
            disabled={busy}
            className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              project
                ? "border-transparent"
                : "border-dashed border-ink-600 text-ink-600 opacity-0 hover:border-ink-400 hover:text-ink-300 group-hover:opacity-100"
            }`}
            style={
              project
                ? { color: project.color, borderColor: project.color + "55" }
                : undefined
            }
          >
            {project ? project.name : "+ project"}
          </button>
          {picking && (
            <span className="absolute right-0 top-7 z-20 flex min-w-36 flex-col overflow-hidden rounded-lg border border-ink-600 bg-ink-800 py-1 shadow-xl">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => assign(p.id)}
                  className="flex items-center gap-2 px-3 py-1.5 text-left font-mono text-[11px] uppercase tracking-wider text-cream-200 hover:bg-ink-700"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: p.color }}
                  />
                  {p.name}
                </button>
              ))}
              {task.projectId && (
                <button
                  onClick={() => assign(null)}
                  className="px-3 py-1.5 text-left font-mono text-[11px] uppercase tracking-wider text-ink-400 hover:bg-ink-700"
                >
                  remove from project
                </button>
              )}
              {projects.length === 0 && (
                <span className="px-3 py-1.5 font-mono text-[11px] text-ink-400">
                  no projects yet
                </span>
              )}
            </span>
          )}
        </span>
      )}

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
