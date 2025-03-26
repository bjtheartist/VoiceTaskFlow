import type { Express } from "express";
import { createServer } from "http";
import OpenAI from "openai";
import { storage } from "./storage";
import { insertTaskSchema } from "@shared/schema";
import type { AIAnalysis } from "@shared/schema";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const BIBLE_VERSES = [
  'john 3:16',
  'philippians 4:13',
  'jeremiah 29:11',
  'psalm 23:1',
  'romans 8:28',
  'matthew 6:33',
  'isaiah 41:10',
  'proverbs 3:5-6',
  'joshua 1:9',
  '2 corinthians 12:9',
  'matthew 11:28',
  'romans 12:2',
  'psalm 46:1',
  'john 14:6',
  'philippians 4:6-7'
];

function getRandomVerse() {
  return BIBLE_VERSES[Math.floor(Math.random() * BIBLE_VERSES.length)];
}

export async function registerRoutes(app: Express) {
  app.get("/api/tasks", async (_req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get("/api/tasks/by-date/:date", async (req, res) => {
    try {
      const date = new Date(req.params.date);
      const tasks = await storage.getTasksByDate(date);
      res.json(tasks);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get("/api/analytics/progress", async (_req, res) => {
    try {
      const progress = await storage.getTaskProgress();
      res.json(progress);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch progress analytics';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get("/api/analytics/categories", async (_req, res) => {
    try {
      const distribution = await storage.getCategoryDistribution();
      res.json(distribution);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category analytics';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/tasks/:id/progress", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const progress = parseInt(req.body.progress);
      const task = await storage.updateTaskProgress(taskId, progress);
      res.json(task);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task progress';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/tasks/:id/confirm", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.confirmTask(taskId);
      res.json(task);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm task';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get("/api/bible-quote", async (_req, res) => {
    try {
      const verse = getRandomVerse();
      const response = await fetch(`https://bible-api.com/${verse}`);
      const data = await response.json();
      res.json({ text: data.text, reference: data.reference });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Bible quote';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/analyze", async (req, res) => {
    try {
      const { transcript } = req.body;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Analyze the following transcript and extract: a brief summary, top 3 priorities, daily tasks, long-term goals, and suggest a category (e.g., 'work', 'personal', 'health', 'education'). Format the response as JSON with the following structure: { summary: string, priorities: string[], dailyTasks: string[], longTermGoals: string[], category: string }"
          },
          {
            role: "user",
            content: transcript
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      const analysis = JSON.parse(content) as AIAnalysis;

      const task = await storage.createTask({
        transcript,
        summary: analysis.summary,
        priorities: analysis.priorities,
        dailyTasks: analysis.dailyTasks,
        longTermGoals: analysis.longTermGoals,
        category: analysis.category || 'uncategorized'
      });

      res.json(analysis);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze transcript';
      res.status(500).json({ message: errorMessage });
    }
  });

  app.post("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updates = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(taskId, updates);
      res.json(task);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      res.status(500).json({ message: errorMessage });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}