import { boolean, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId:    text("user_id").notNull().default("legacy_user"),
  role:      text("role").notNull().default("user"),
  title: text("title").notNull(),
  done: boolean("done").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;