import type { Task, InsertTask } from "@shared/schema";

export interface IStorage {
  createTask(task: InsertTask): Promise<Task>;
  getTask(id: number): Promise<Task | undefined>;
  getTasks(): Promise<Task[]>;
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
}

export const storage = new MemStorage();