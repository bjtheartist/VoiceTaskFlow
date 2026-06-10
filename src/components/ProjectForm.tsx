"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n }),
      });
      if (res.ok) {
        setName("");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={create}
      className="flex items-center gap-3 rounded-xl border border-dashed border-ink-600 px-4 py-3 transition-colors focus-within:border-ember-400/50"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-dashed border-ink-600 text-ink-400">
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
          <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Start a new project…"
        className="min-w-0 flex-1 bg-transparent font-body text-[17px] text-cream-100 placeholder:italic placeholder:text-ink-400 focus:outline-none"
      />
      {name.trim() && (
        <button
          type="submit"
          disabled={busy}
          className="font-mono text-[11px] uppercase tracking-[0.15em] text-ember-400 hover:text-ember-300 disabled:opacity-50"
        >
          Create
        </button>
      )}
    </form>
  );
}
