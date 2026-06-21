ALTER TABLE "tasks" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;