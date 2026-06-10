import {
  pgTable,
  serial,
  text,
  date,
  boolean,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  entryDate: date("entry_date").notNull(),
  transcript: text("transcript").notNull(),
  summary: text("summary").notNull(),
  mood: text("mood"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#eaa83f"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").references(() => entries.id, {
    onDelete: "set null",
  }),
  projectId: integer("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  taskDate: date("task_date").notNull(),
  done: boolean("done").default(false).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Entry = typeof entries.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Project = typeof projects.$inferSelect;
