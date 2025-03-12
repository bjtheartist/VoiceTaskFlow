import type { Task, InsertTask, TaskProgress, CategoryDistribution } from "@shared/schema";
import { format, subDays } from "date-fns";

export interface IStorage {
  createTask(task: InsertTask): Promise<Task>;
  getTask(id: number): Promise<Task | undefined>;
  getTasks(): Promise<Task[]>;
  getTasksByDate(date: Date): Promise<Task[]>;
  confirmTask(id: number): Promise<Task>;
  updateTaskProgress(id: number, progress: number): Promise<Task>;
  getTaskProgress(): Promise<TaskProgress>;
  getCategoryDistribution(): Promise<CategoryDistribution[]>;
}

export class MemStorage implements IStorage {
  private tasks: Map<number, Task>;
  private currentId: number;

  constructor() {
    this.tasks = new Map();
    this.currentId = 1;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentId++;
    const task: Task = {
      id,
      ...insertTask,
      createdAt: new Date(),
      isConfirmed: false,
      progress: 0,
      completedAt: null,
      priorities: Array.isArray(insertTask.priorities) ? insertTask.priorities : [],
      dailyTasks: Array.isArray(insertTask.dailyTasks) ? insertTask.dailyTasks : [],
      longTermGoals: Array.isArray(insertTask.longTermGoals) ? insertTask.longTermGoals : [],
    };
    this.tasks.set(id, task);
    return task;
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByDate(date: Date): Promise<Task[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Array.from(this.tasks.values()).filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= startOfDay && taskDate <= endOfDay;
    });
  }

  async confirmTask(id: number): Promise<Task> {
    const task = await this.getTask(id);
    if (!task) {
      throw new Error('Task not found');
    }

    const updatedTask = { 
      ...task, 
      isConfirmed: true, 
      progress: 100,
      completedAt: new Date() 
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async updateTaskProgress(id: number, progress: number): Promise<Task> {
    const task = await this.getTask(id);
    if (!task) {
      throw new Error('Task not found');
    }

    const updatedTask = { 
      ...task, 
      progress: Math.min(100, Math.max(0, progress)),
      isConfirmed: progress === 100,
      completedAt: progress === 100 ? new Date() : null
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async getTaskProgress(): Promise<TaskProgress> {
    const tasks = Array.from(this.tasks.values());
    const completed = tasks.filter(t => t.isConfirmed).length;
    const total = tasks.length;

    // Calculate completion rate by category
    const byCategory: Record<string, number> = {};
    tasks.forEach(task => {
      if (!byCategory[task.category]) {
        byCategory[task.category] = 0;
      }
      if (task.isConfirmed) {
        byCategory[task.category]++;
      }
    });

    // Calculate recent trend (last 7 days)
    const recentTrend = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTasks = tasks.filter(task => 
        format(new Date(task.createdAt), 'yyyy-MM-dd') === dateStr
      );

      return {
        date: dateStr,
        completed: dayTasks.filter(t => t.isConfirmed).length,
        added: dayTasks.length
      };
    }).reverse();

    return {
      completed,
      total,
      rate: total ? (completed / total) * 100 : 0,
      byCategory,
      recentTrend
    };
  }

  async getCategoryDistribution(): Promise<CategoryDistribution[]> {
    const tasks = Array.from(this.tasks.values());
    const categories = new Map<string, { total: number; completed: number }>();

    tasks.forEach(task => {
      if (!categories.has(task.category)) {
        categories.set(task.category, { total: 0, completed: 0 });
      }
      const stats = categories.get(task.category)!;
      stats.total++;
      if (task.isConfirmed) {
        stats.completed++;
      }
    });

    return Array.from(categories.entries()).map(([category, stats]) => ({
      category,
      count: stats.total,
      completionRate: stats.total ? (stats.completed / stats.total) * 100 : 0
    }));
  }
}

export const storage = new MemStorage();