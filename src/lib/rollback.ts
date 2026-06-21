import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function rollback() {
  await db.execute(`ALTER TABLE tasks DROP COLUMN IF EXISTS user_id`);
  await db.execute(`ALTER TABLE tasks DROP COLUMN IF EXISTS role`);
  console.log("Rollback complete");
}

rollback();