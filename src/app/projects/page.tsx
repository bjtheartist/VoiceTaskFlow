import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { projects, tasks } from "@/db/schema";
import ProjectForm from "@/components/ProjectForm";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      color: projects.color,
      createdAt: projects.createdAt,
      total: sql<number>`count(${tasks.id})::int`,
      done: sql<number>`count(${tasks.id}) filter (where ${tasks.done})::int`,
    })
    .from(projects)
    .leftJoin(tasks, eq(tasks.projectId, projects.id))
    .groupBy(projects.id)
    .orderBy(desc(projects.createdAt));

  const active = rows.filter((p) => p.total === 0 || p.done < p.total);
  const completed = rows.filter((p) => p.total > 0 && p.done === p.total);

  return (
    <div>
      <div className="rise flex items-end justify-between pt-8">
        <h1 className="font-display text-3xl text-cream-100">Projects</h1>
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-400">
          {completed.length}/{rows.length} complete
        </span>
      </div>

      <div className="rise rise-1 mt-8">
        <ProjectForm />
      </div>

      {rows.length === 0 && (
        <p className="rise rise-2 mt-10 text-center font-body italic text-ink-400">
          No projects yet. Create one above, then assign tasks to it from any task list.
        </p>
      )}

      {active.length > 0 && (
        <ul className="rise rise-2 mt-8 space-y-3">
          {active.map((p) => (
            <ProjectRow key={p.id} project={p} />
          ))}
        </ul>
      )}

      {completed.length > 0 && (
        <section className="rise rise-3 mt-12">
          <div className="mb-4 flex items-center gap-4">
            <h2 className="shrink-0 font-display text-lg text-sage-400">Completed</h2>
            <div className="h-px flex-1 bg-ink-700" />
          </div>
          <ul className="space-y-3">
            {completed.map((p) => (
              <ProjectRow key={p.id} project={p} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ProjectRow({
  project,
}: {
  project: {
    id: number;
    name: string;
    color: string;
    total: number;
    done: number;
  };
}) {
  const pct = project.total === 0 ? 0 : Math.round((project.done / project.total) * 100);
  const isComplete = project.total > 0 && project.done === project.total;

  return (
    <li>
      <Link
        href={`/projects/${project.id}`}
        className="block rounded-xl border border-ink-700 bg-ink-900/60 p-5 transition-colors hover:border-ink-600 hover:bg-ink-800/60"
      >
        <div className="flex items-baseline justify-between gap-4">
          <span className="flex min-w-0 items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: project.color }}
            />
            <span className="truncate font-display text-xl text-cream-100">
              {project.name}
            </span>
            {isComplete && (
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-sage-400">
                ✓ complete
              </span>
            )}
          </span>
          <span className="shrink-0 font-mono text-[11px] tracking-wider text-ink-400">
            {project.total === 0 ? "no tasks" : `${project.done}/${project.total}`}
          </span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-ink-700">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: isComplete ? "var(--color-sage-400)" : project.color,
            }}
          />
        </div>
      </Link>
    </li>
  );
}
