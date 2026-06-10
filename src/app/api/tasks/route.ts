import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { todayISO } from "@/lib/dates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "Title is empty" }, { status: 400 });
    }
    const taskDate =
      typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
        ? body.date
        : todayISO();

    const projectId =
      typeof body.projectId === "number" ? body.projectId : null;

    const [task] = await db
      .insert(tasks)
      .values({ title, taskDate, projectId })
      .returning();
    return NextResponse.json({ task });
  } catch (err) {
    console.error("Failed to create task:", err);
    return NextResponse.json({ error: "Failed to add task" }, { status: 500 });
  }
}
