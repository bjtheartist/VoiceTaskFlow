"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddTask() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: t,
          date: new Intl.DateTimeFormat("en-CA").format(new Date()),
        }),
      });
      if (res.ok) {
        setTitle("");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={add} className="mt-1 flex items-center gap-3 px-3 py-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-dashed border-ink-600 text-ink-400">
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
          <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task by hand…"
        className="min-w-0 flex-1 bg-transparent font-body text-[17px] text-cream-100 placeholder:italic placeholder:text-ink-400 focus:outline-none"
      />
      {title.trim() && (
        <button
          type="submit"
          disabled={busy}
          className="font-mono text-[11px] uppercase tracking-[0.15em] text-ember-400 hover:text-ember-300 disabled:opacity-50"
        >
          Add
        </button>
      )}
    </form>
  );
}
