import { desc, asc } from "drizzle-orm";
import { db } from "@/db";
import { entries, tasks, projects } from "@/db/schema";
import { relativeLabel, todayISO } from "@/lib/dates";
import TaskItem from "@/components/TaskItem";
import EntryCard from "@/components/EntryCard";
import type { Entry, Task } from "@/db/schema";

export const dynamic = "force-dynamic";

function computeStreak(dates: string[], today: string): number {
  const set = new Set(dates);
  let streak = 0;
  const cursor = new Date(today + "T12:00:00");
  // A streak survives if today itself has no entry yet
  if (!set.has(today)) cursor.setDate(cursor.getDate() - 1);
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default async function JournalPage() {
  const [allEntries, allTasks, allProjects] = await Promise.all([
    db.select().from(entries).orderBy(desc(entries.createdAt)),
    db.select().from(tasks).orderBy(asc(tasks.createdAt)),
    db
      .select({ id: projects.id, name: projects.name, color: projects.color })
      .from(projects)
      .orderBy(asc(projects.name)),
  ]);

  const days = new Map<string, { entries: Entry[]; tasks: Task[] }>();
  for (const e of allEntries) {
    if (!days.has(e.entryDate)) days.set(e.entryDate, { entries: [], tasks: [] });
    days.get(e.entryDate)!.entries.push(e);
  }
  for (const t of allTasks) {
    if (!days.has(t.taskDate)) days.set(t.taskDate, { entries: [], tasks: [] });
    days.get(t.taskDate)!.tasks.push(t);
  }
  const sortedDays = [...days.keys()].sort().reverse();

  const today = todayISO();
  const doneTotal = allTasks.filter((t) => t.done).length;
  const streak = computeStreak(
    allEntries.map((e) => e.entryDate),
    today
  );

  return (
    <div>
      <div className="rise flex items-end justify-between pt-8">
        <h1 className="font-display text-3xl text-cream-100">Journal</h1>
        <div className="flex gap-6 text-right font-mono text-[11px] uppercase tracking-[0.15em] text-ink-400">
          <div>
            <span className="block font-display text-xl normal-case tracking-normal text-ember-300">
              {streak}
            </span>
            day streak
          </div>
          <div>
            <span className="block font-display text-xl normal-case tracking-normal text-cream-100">
              {doneTotal}
              <span className="text-ink-400">/{allTasks.length}</span>
            </span>
            tasks done
          </div>
          <div>
            <span className="block font-display text-xl normal-case tracking-normal text-cream-100">
              {days.size}
            </span>
            days
          </div>
        </div>
      </div>

      {sortedDays.length === 0 ? (
        <p className="rise rise-2 mt-12 text-center font-body italic text-ink-400">
          Your journal is empty. Go to Today and speak your first note.
        </p>
      ) : (
        <div className="mt-10 space-y-12">
          {sortedDays.map((day, i) => {
            const { entries: dayEntries, tasks: dayTasks } = days.get(day)!;
            return (
              <section key={day} className={`rise ${i < 4 ? `rise-${i + 1}` : ""}`}>
                <div className="mb-4 flex items-center gap-4">
                  <h2 className="shrink-0 font-display text-lg text-ember-300">
                    {relativeLabel(day)}
                  </h2>
                  <div className="h-px flex-1 bg-ink-700" />
                  {dayTasks.length > 0 && (
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-400">
                      {dayTasks.filter((t) => t.done).length}/{dayTasks.length} tasks
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {dayEntries.map((e) => (
                    <EntryCard key={e.id} entry={e} />
                  ))}
                  {dayTasks.length > 0 && (
                    <ul className="space-y-0.5 pt-1">
                      {dayTasks.map((t) => (
                        <TaskItem key={t.id} task={t} projects={allProjects} />
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
