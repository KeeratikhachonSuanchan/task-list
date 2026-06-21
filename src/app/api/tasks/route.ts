import { NextResponse } from "next/server";
import db from "@/lib/db";
import { tasks } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized, Please login first." }, { status: 401 });
  }
  const role = (sessionClaims?.metadata as {role?: string })?.role;
  console.log("User Role:", role);
  try {
    if (role === "admin") {
      const allTasks = await db.query.tasks.findMany({
        orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
      });
      return NextResponse.json(allTasks);
    }
    const userTasks = await db.query.tasks.findMany({
      where: eq(tasks.userId, userId),
      orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
    });
    return NextResponse.json(userTasks);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized, Please login first." }, { status: 401 });
  }
  try {
    const { title } = await request.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (title.trim().length < 2) {
      return NextResponse.json(
        { error: "Title must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (title.trim().length > 100) {
      return NextResponse.json(
        { error: "Title must not exceed 100 characters" },
        { status: 400 }
      );
    }

    const [task] = await db.insert(tasks).values({ userId,title: title.trim() }).returning();
    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized, Please login first." }, { status: 401 });
  }
  try {
    const { id, done } = await request.json();

    if (!id || typeof done !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const [task] = await db.update(tasks).set({ done }).where(and(eq(tasks.id, id), eq(tasks.userId, userId))).returning();

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch {
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized, Please login first." }, { status: 401 });
  }
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized, Please login first." }, { status: 401 });
  }
  try {
    const { id, title } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (title.trim().length < 2) {
      return NextResponse.json(
        { error: "Title must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (title.trim().length > 100) {
      return NextResponse.json(
        { error: "Title must not exceed 100 characters" },
        { status: 400 }
      );
    }

    const [task] = await db
      .update(tasks)
      .set({ title: title.trim() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch {
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}