# Task List App

## Which auth approach you chose and why
- ใช้ Clerk เพราะว่า สะดวกและสามารถ setup ได้เร็ว มี UI สำเร็จรูปไม่ต้องทำหน้า Login เอง และรองรับ Next.js App Router เหมาะสำหรับผู้เริ่มต้น

## What is protected vs. public in your app
- **Protected:** GET/POST/PATCH/PUT/DELETE /api/tasks — ต้อง Login ถึงจะทำงานได้
- **Public:** หน้า Home แสดงได้โดยไม่ต้อง Login

## Per-user Data
แต่ละ user เห็นแค่ tasks ของตัวเอง โดยเก็บ userId จาก Clerk ไว้ในทุก task

## Which migration/seed tooling you used and the exact commands to run them

### Migration & Seed Tooling
ใช้ **Drizzle Kit** สำหรับ migration และ **tsx** สำหรับรัน seed/rollback script

### Migration
npx drizzle-kit generate
npx drizzle-kit migrate
ถ้า 'npx drizzle-kit migrate' แล้ว Database ไม่เปลี่ยนแปลง ใช้ 'npx drizzle-kit push'

### Rollback
npx tsx src/lib/rollback.ts

### Seed
npx tsx src/lib/seed.ts

## How to Run Locally
1. Clone repo
2. Create .env.local and Add value example in example.env
3. Run 'npm install && npm run dev'
