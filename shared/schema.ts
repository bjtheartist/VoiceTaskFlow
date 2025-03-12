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
  category: text("category").default('uncategorized').notNull(),
  progress: integer("progress").default(0).notNull(), // 0-100 percentage
  completedAt: timestamp("completed_at"),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  isConfirmed: true,
  progress: true,
  completedAt: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// AI Analysis Response Type
export interface AIAnalysis {
  summary: string;
  priorities: string[];
  dailyTasks: string[];
  longTermGoals: string[];
  category?: string; // AI can suggest a category
}

// Analytics Types
export interface TaskProgress {
  completed: number;
  total: number;
  rate: number;
  byCategory: Record<string, number>;
  recentTrend: {
    date: string;
    completed: number;
    added: number;
  }[];
}

export interface CategoryDistribution {
  category: string;
  count: number;
  completionRate: number;
}