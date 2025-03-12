import type { Task, InsertTask } from "@shared/schema";

export interface IStorage {
  createTask(task: InsertTask): Promise<Task>;
  getTask(id: number): Promise<Task | undefined>;
  getTasks(): Promise<Task[]>;
  getTasksByDate(date: Date): Promise<Task[]>;
  confirmTask(id: number): Promise<Task>;
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

    const updatedTask = { ...task, isConfirmed: true };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
}

export const storage = new MemStorage();