import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  transcript: text("transcript").notNull(),
  summary: text("summary").notNull(),
  priorities: jsonb("priorities").$type<string[]>().notNull(),
  dailyTasks: jsonb("daily_tasks").$type<string[]>().notNull(),
  longTermGoals: jsonb("long_term_goals").$type<string[]>().notNull(),
  isConfirmed: boolean("is_confirmed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  isConfirmed: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// AI Analysis Response Type
export interface AIAnalysis {
  summary: string;
  priorities: string[];
  dailyTasks: string[];
  longTermGoals: string[];
}