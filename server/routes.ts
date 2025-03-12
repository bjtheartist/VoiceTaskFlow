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

export async function registerRoutes(app: Express) {
  app.get("/api/bible-quote", async (_req, res) => {
    try {
      const response = await fetch("https://bible-api.com/john 3:16");
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
            content: "Analyze the following transcript and extract: a brief summary, top 3 priorities, daily tasks, and long-term goals. Format the response as JSON with the following structure: { summary: string, priorities: string[], dailyTasks: string[], longTermGoals: string[] }"
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
        longTermGoals: analysis.longTermGoals
      });

      res.json(analysis);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze transcript';
      res.status(500).json({ message: errorMessage });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}