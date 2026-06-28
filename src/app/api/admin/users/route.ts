import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { tasks } from "@/lib/schema";
import { count } from "drizzle-orm";

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) return null;
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") return null;
  return userId;
}

export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const client = await clerkClient();
    const { data: users } = await client.users.getUserList({ limit: 100 });

    const taskCounts = await db
      .select({ userId: tasks.userId, count: count() })
      .from(tasks)
      .groupBy(tasks.userId);

    const countMap = new Map(taskCounts.map((t) => [t.userId, t.count]));

    const result = users.map((u) => ({
      id: u.id,
      email: u.emailAddresses[0]?.emailAddress ?? "",
      name: [u.firstName, u.lastName].filter(Boolean).join(" ") || "No name",
      imageUrl: u.imageUrl,
      role: (u.publicMetadata as { role?: string })?.role ?? "user",
      taskCount: countMap.get(u.id) ?? 0,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { targetUserId, role } = await request.json();

    if (!targetUserId || !["user", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (targetUserId === adminId) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    const client = await clerkClient();
    await client.users.updateUserMetadata(targetUserId, {
      publicMetadata: { role },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}
