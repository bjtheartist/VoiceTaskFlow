import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { entries, tasks } from "@/db/schema";
import { structureTranscript } from "@/lib/structure";
import { todayISO } from "@/lib/dates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transcript = typeof body.transcript === "string" ? body.transcript.trim() : "";
    if (!transcript) {
      return NextResponse.json({ error: "Transcript is empty" }, { status: 400 });
    }
    const entryDate =
      typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
        ? body.date
        : todayISO();
    const projectId =
      typeof body.projectId === "number" ? body.projectId : null;

    const structured = await structureTranscript(transcript);

    const [entry] = await db
      .insert(entries)
      .values({
        entryDate,
        projectId,
        transcript,
        summary: structured.summary,
        mood: structured.mood,
      })
      .returning();

    let createdTasks: (typeof tasks.$inferSelect)[] = [];
    if (structured.tasks.length > 0) {
      createdTasks = await db
        .insert(tasks)
        .values(
          structured.tasks.map((title) => ({
            entryId: entry.id,
            projectId,
            title,
            taskDate: entryDate,
          }))
        )
        .returning();
    }

    return NextResponse.json({ entry, tasks: createdTasks });
  } catch (err) {
    console.error("Failed to create entry:", err);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}
