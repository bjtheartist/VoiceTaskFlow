import { apiRequest } from "./queryClient";
import type { AIAnalysis } from "@shared/schema";

export async function analyzeTranscript(transcript: string): Promise<AIAnalysis> {
  try {
    const response = await apiRequest("POST", "/api/analyze", { transcript });
    const data = await response.json();
    return data as AIAnalysis;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error("Failed to analyze transcript: " + errorMessage);
  }
}