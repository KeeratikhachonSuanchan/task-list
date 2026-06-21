import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { tasks } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const SEED_USER_ID = "seed_user_001";

const seedTasks = [
  { title: "Learn Next.js",         done: true  },
  { title: "Connect Neon database", done: true  },
  { title: "Add authentication",    done: false },
  { title: "Deploy to Vercel",      done: false },
];

async function seed() {
  // Delete old seed data
  await db.delete(tasks).where(eq(tasks.userId, SEED_USER_ID));

  for (const task of seedTasks) {
    await db.insert(tasks).values({ userId: SEED_USER_ID, title: task.title, done: task.done }).returning();
  }

  console.log("Seed complete:", seedTasks.length, "tasks inserted");
}

seed();