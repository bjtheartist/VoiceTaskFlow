import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, tasks } from "@/db/schema";
import TaskItem from "@/components/TaskItem";
import AddTask from "@/components/AddTask";
import DeleteProject from "@/components/DeleteProject";
import { shortLabel } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = parseInt(id, 10);
  if (Number.isNaN(projectId)) notFound();

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));
  if (!project) notFound();

  const projectTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .orderBy(asc(tasks.done), asc(tasks.createdAt));

  const done = projectTasks.filter((t) => t.done).length;
  const total = projectTasks.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const isComplete = total > 0 && done === total;

  return (
    <div>
      <div className="rise pt-8">
        <Link
          href="/projects"
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400 hover:text-cream-200"
        >
          ← all projects
        </Link>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h1 className="flex min-w-0 items-center gap-3 font-display text-3xl text-cream-100">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ background: project.color }}
            />
            <span className="truncate">{project.name}</span>
          </h1>
          <span className="shrink-0 font-mono text-[12px] tracking-wider text-ink-400">
            {done}/{total} done
          </span>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink-700">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: isComplete ? "var(--color-sage-400)" : project.color,
            }}
          />
        </div>

        {isComplete && (
          <p className="mt-4 font-body text-lg italic text-sage-400">
            ✓ Every task is done — this project is complete.
          </p>
        )}
      </div>

      <section className="rise rise-2 mt-8">
        {projectTasks.length === 0 ? (
          <p className="px-3 py-2 font-body italic text-ink-400">
            No tasks yet. Add one below, or assign existing tasks from Today or
            the Journal using the “+ project” tag.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {projectTasks.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                showDate={shortLabel(t.taskDate)}
                projects={[project]}
                hideProjectTag
              />
            ))}
          </ul>
        )}
        <AddTask projectId={project.id} />
      </section>

      <div className="rise rise-3 mt-14 flex justify-end border-t border-ink-700 pt-4">
        <DeleteProject projectId={project.id} />
      </div>
    </div>
  );
}
