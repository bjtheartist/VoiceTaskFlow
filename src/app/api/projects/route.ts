import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";

// Rotating palette so each project gets a distinct accent
const PALETTE = ["#eaa83f", "#93b08a", "#7fa3c4", "#c48a9a", "#b39ddb", "#d4a373"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Name is empty" }, { status: 400 });
    }
    const existing = await db.select({ id: projects.id }).from(projects);
    const color = PALETTE[existing.length % PALETTE.length];

    const [project] = await db.insert(projects).values({ name, color }).returning();
    return NextResponse.json({ project });
  } catch (err) {
    console.error("Failed to create project:", err);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
