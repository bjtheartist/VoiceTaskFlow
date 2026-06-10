import { and, asc, desc, eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { entries, tasks, projects } from "@/db/schema";
import { todayISO, dayLabel, shortLabel } from "@/lib/dates";
import Recorder from "@/components/Recorder";
import TaskItem from "@/components/TaskItem";
import AddTask from "@/components/AddTask";
import EntryCard from "@/components/EntryCard";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const today = todayISO();

  const [todayEntries, todayTasks, carryover, allProjects] = await Promise.all([
    db
      .select()
      .from(entries)
      .where(eq(entries.entryDate, today))
      .orderBy(desc(entries.createdAt)),
    db
      .select()
      .from(tasks)
      .where(eq(tasks.taskDate, today))
      .orderBy(asc(tasks.done), asc(tasks.createdAt)),
    db
      .select()
      .from(tasks)
      .where(and(lt(tasks.taskDate, today), eq(tasks.done, false)))
      .orderBy(asc(tasks.taskDate)),
    db
      .select({ id: projects.id, name: projects.name, color: projects.color })
      .from(projects)
      .orderBy(asc(projects.name)),
  ]);

  const doneCount = todayTasks.filter((t) => t.done).length;

  return (
    <div>
      <div className="rise pt-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ember-400">
          {dayLabel(today)}
        </p>
      </div>

      <div className="rise rise-1">
        <Recorder />
      </div>

      <section className="rise rise-2 mt-8">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-display text-xl text-cream-100">Today&apos;s tasks</h2>
          {todayTasks.length > 0 && (
            <span className="font-mono text-[11px] tracking-wider text-ink-400">
              {doneCount}/{todayTasks.length} done
            </span>
          )}
        </div>
        {todayTasks.length === 0 ? (
          <p className="px-3 py-2 font-body italic text-ink-400">
            Nothing yet — speak a note and your tasks will land here.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {todayTasks.map((t) => (
              <TaskItem key={t.id} task={t} projects={allProjects} />
            ))}
          </ul>
        )}
        <AddTask />
      </section>

      {carryover.length > 0 && (
        <section className="rise rise-3 mt-10">
          <h2 className="mb-2 font-display text-xl text-cream-100">
            Carried over
            <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400">
              still open from earlier days
            </span>
          </h2>
          <ul className="space-y-0.5">
            {carryover.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                showDate={shortLabel(t.taskDate)}
                projects={allProjects}
              />
            ))}
          </ul>
        </section>
      )}

      {todayEntries.length > 0 && (
        <section className="rise rise-4 mt-10">
          <h2 className="mb-3 font-display text-xl text-cream-100">
            Today&apos;s notes
          </h2>
          <div className="space-y-3">
            {todayEntries.map((e) => (
              <EntryCard key={e.id} entry={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
