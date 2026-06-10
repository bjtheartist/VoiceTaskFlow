import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tasks } from "@/db/schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const taskId = parseInt(id, 10);
    if (Number.isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
    }
    const body = await req.json();

    const updates: Partial<typeof tasks.$inferInsert> = {};
    if (typeof body.done === "boolean") {
      updates.done = body.done;
      updates.completedAt = body.done ? new Date() : null;
    }
    if (typeof body.title === "string" && body.title.trim()) {
      updates.title = body.title.trim();
    }
    if ("projectId" in body) {
      updates.projectId =
        typeof body.projectId === "number" ? body.projectId : null;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, taskId))
      .returning();
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ task });
  } catch (err) {
    console.error("Failed to update task:", err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const taskId = parseInt(id, 10);
    if (Number.isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
    }
    await db.delete(tasks).where(eq(tasks.id, taskId));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete task:", err);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
