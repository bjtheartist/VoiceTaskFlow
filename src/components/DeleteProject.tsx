"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProject({ projectId }: { projectId: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (res.ok) router.push("/projects");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return confirming ? (
    <span className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.15em]">
      <span className="text-ink-300">delete? tasks are kept</span>
      <button onClick={remove} disabled={busy} className="text-red-400/90 hover:text-red-300">
        yes
      </button>
      <button onClick={() => setConfirming(false)} className="text-ink-400 hover:text-cream-200">
        no
      </button>
    </span>
  ) : (
    <button
      onClick={() => setConfirming(true)}
      className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-400 transition-colors hover:text-red-400/80"
    >
      delete project
    </button>
  );
}
