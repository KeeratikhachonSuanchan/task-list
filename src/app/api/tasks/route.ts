import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    const tasks = await sql`
      SELECT * FROM tasks ORDER BY created_at DESC
    `;
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title } = await request.json();

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const [task] = await sql`
      INSERT INTO tasks (title) VALUES (${title}) RETURNING *
    `;
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}