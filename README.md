# Task List App

แอปจัดการรายการงาน สร้างด้วย Next.js 16, Tailwind CSS v4, Clerk (ระบบ auth) และ Drizzle ORM (Neon PostgreSQL)

## วิธีรันโปรเจกต์
1. Clone repo
2. สร้างไฟล์ `.env.local` แล้วใส่ค่าตาม `example.env`
3. รัน `npm install && npm run dev`

---

## Assignment 3 — Auth & Database

### ระบบ Auth ที่เลือกใช้
- **Clerk** — ติดตั้งง่าย มี UI สำเร็จรูป (ไม่ต้องทำหน้า Login เอง) รองรับ Next.js App Router เหมาะสำหรับผู้เริ่มต้น

### ส่วนที่ Protected vs. Public
- **Protected:** GET/POST/PATCH/PUT/DELETE `/api/tasks` — ต้อง Login ถึงจะใช้ได้
- **Public:** หน้า Home เปิดดูได้โดยไม่ต้อง Login (แต่ไม่แสดง task)

### ข้อมูลแยกตาม User
แต่ละ user เห็นแค่ task ของตัวเอง โดยเก็บ `userId` จาก Clerk ไว้ในทุก task · Admin เห็นทุก task

### Migration & Seed

ใช้ **Drizzle Kit** สำหรับ migration และ **tsx** สำหรับรัน seed/rollback script

```bash
# สร้างและรัน migration
npx drizzle-kit generate
npx drizzle-kit migrate
# ถ้า migrate ไม่ apply ให้ใช้:
npx drizzle-kit push

# Seed ข้อมูลตัวอย่าง
npx tsx src/lib/seed.ts

# Rollback (ลบ column user_id และ role)
npx tsx src/lib/rollback.ts
```

---

## Assignment 4 — UX/UI Polish

### Design Tokens

สี, มุมโค้ง และเงา ทั้งหมดถูกนิยามเป็น CSS variable ไว้ใน `src/app/globals.css` แล้ว map เข้า Tailwind utility ผ่าน `@theme inline` — แก้ที่เดียวเปลี่ยนทั้งแอป

#### ชุดสี (Color Palette)

| Token | Light | Dark | ใช้กับ |
|-------|-------|------|--------|
| `--background` | `#ffffff` | `#0b0d12` | พื้นหลังหน้า |
| `--surface` | `#ffffff` | `#14171f` | พื้นหลัง header/footer/card |
| `--surface-2` | `#f4f5f7` | `#1c212b` | สถานะ hover, skeleton |
| `--foreground` | `#171717` | `#e6e8eb` | ตัวอักษรหลัก |
| `--muted` | `#6b7280` | `#9aa3b2` | ตัวอักษรรอง, placeholder |
| `--border` | `#e5e7eb` | `#2a2f3a` | เส้นขอบ |
| `--primary` | `#2563eb` | `#60a5fa` | ปุ่มหลัก, link, focus ring |
| `--primary-hover` | `#1d4ed8` | `#3b82f6` | สถานะ hover ของปุ่มหลัก |
| `--success` | `#12823b` | `#34d399` | งานที่เสร็จ, ปุ่ม save |
| `--warning` | `#b45309` | `#fbbf24` | งานที่ยังไม่เสร็จ (Pending) |
| `--danger` | `#dc2626` | `#f87171` | ปุ่มลบ, ข้อความ error |

#### ขนาดตัวอักษร (Typography Scale)
ใช้ scale ของ Tailwind อย่างสม่ำเสมอ ไม่ใช้ค่ามั่ว:
- `text-2xl` — หัวข้อหน้า
- `text-lg` — โลโก้
- `text-sm` — ข้อความทั่วไป, ปุ่ม, input
- `text-xs` — ข้อความรอง

#### ระยะห่าง (Spacing)
ใช้ spacing scale ฐาน 4px ของ Tailwind อย่างสม่ำเสมอ (ไม่มี magic numbers):
- `gap-2` / `gap-4` — ระยะระหว่าง element
- `p-4 md:p-6` — padding ของ container
- `py-2` / `py-3` — padding ของปุ่ม/input
- `space-y-2` — ระยะห่างระหว่าง task item
- `mt-6 md:mt-10` — margin ของ section

#### Token อื่นๆ
- `--radius-card: 0.75rem` — มุมโค้งสม่ำเสมอ
- `--shadow-card` — เงาบางๆ สำหรับ card/dropdown

### Dark Mode

- **วิธีการ:** ใช้ class-based dark mode ของ Tailwind v4 ผ่าน `@custom-variant dark`
- **ปุ่ม toggle:** component `ThemeToggle` เอง (☀️/🌙) อยู่ใน header
- **จำค่าได้:** บันทึกลง `localStorage` อ่านตอนโหลดหน้าผ่าน inline script
- **กัน flash จอขาว (FOUC):** ใส่ `<script>` ใน `<head>` เพื่อเซ็ต class `.dark` ก่อน paint แรก
- **Fallback:** ถ้ายังไม่เคยเลือก จะใช้ค่าตาม OS (`prefers-color-scheme`)

### Accessibility (การเข้าถึง)

| ข้อกำหนด | วิธีจัดการ |
|----------|----------|
| **คีย์บอร์ด** | ทุก element ที่กดได้เข้าถึงด้วย Tab · CRUD ทำได้ด้วยคีย์บอร์ดล้วน · Esc ปิด mobile menu |
| **Focus state** | ทุกปุ่มและ input มี `focus-visible:ring-2 focus-visible:ring-primary` ผ่าน shared component (`Button`, `Input`) |
| **Semantic HTML** | ใช้ `<main>`, `<nav>`, `<header>`, `<footer>` ถูกต้อง · navigation ใช้ `<Link>` · action ใช้ `<button>` |
| **Color contrast** | ทุกคู่สี text/background เช็คผ่าน WCAG AA (4.5:1) ด้วย WebAIM · สี warning ใช้ `#b45309` (ไม่ใช่ yellow-500) เพื่อให้ contrast ผ่านบนพื้นขาว |
| **Labels** | input มี `aria-label` ("New task", "Edit task") · ปุ่ม toggle/hamburger มี `aria-label` · ปุ่ม mobile menu มี `aria-expanded` |
| **แจ้ง screen reader** | Toast มี `role="status"` + `aria-live="polite"` — ข้อความสำเร็จ/error ถูกอ่านออกเสียงอัตโนมัติ |
| **ลดการเคลื่อนไหว** | `prefers-reduced-motion: reduce` ใน global CSS ปิด animation/transition ทั้งหมด |

### UI States (สถานะหน้าจอ)

| สถานะ | อยู่ที่ | วิธีทำ |
|-------|--------|--------|
| **กำลังโหลด** | รายการ task (`page.tsx`) | Skeleton 4 แถว `animate-pulse` ระหว่างดึงข้อมูล |
| **ไม่มีข้อมูล** | รายการ task (`page.tsx`) | icon 📝 + "No tasks yet" + "Add your first task to get started!" |
| **โหลดผิดพลาด** | รายการ task (`page.tsx`) | icon ⚠️ + ข้อความ error + ปุ่ม Retry (เรียก `getTasks()` ใหม่) |
| **Validation error** | ฟอร์ม add/edit (`page.tsx`) | ข้อความแดงใต้ input |
| **สำเร็จ** | ทุก action (`page.tsx`) | Toast สีเขียว (หายเองใน 3 วิ) ผ่าน `useToast()` |
| **Action ผิดพลาด** | ทุก action (`page.tsx`) | Toast สีแดง (หายเองใน 3 วิ) |
| **กำลังส่ง** | ปุ่ม Add (`page.tsx`) | Spinner หมุนใน `<Button loading>` + ปุ่มกดไม่ได้ |
| **Disabled** | ปุ่ม Add (`page.tsx`) | `disabled:opacity-50 disabled:cursor-not-allowed` ระหว่าง submit |

### Responsive Design

- **มือถือ (~375px):** เมนูเป็น hamburger, layout แนวตั้ง, tap target ขนาดเหมาะสม
- **แท็บเล็ต (~768px):** nav แสดงเต็มแนวนอน, padding กว้างขึ้น
- **เดสก์ท็อป (~1280px+):** container `max-w-3xl` อยู่กลางจอ
- ไม่มี scroll แนวนอน ไม่มีเนื้อหาโดนตัด ทุกขนาดจอ

### Motion & Transitions

- `transition-colors` บนทุกปุ่มและ link (hover/focus)
- `animate-fade-in-down` (150ms) ตอนเปิด mobile menu
- `animate-fade-in` (200ms) ตอน task item โหลด และ toast เด้ง
- animation ทั้งหมดเคารพ `prefers-reduced-motion: reduce` (ปิดอัตโนมัติถ้าผู้ใช้ตั้งค่าลดการเคลื่อนไหว)

### Shared Components

อยู่ใน `src/components/ui/`:

| Component | ความสามารถ |
|-----------|-----------|
| `Button` | 3 variant (primary/danger/ghost), spinner ตอน loading, focus ring, disabled state |
| `Input` | สี token, focus ring, รองรับ dark mode |
| `Skeleton` | กล่อง animate-pulse สำหรับสถานะกำลังโหลด |
| `Toast` | ใช้ React Context เรียกจากที่ไหนก็ได้, หายเองใน 3 วิ, แยก success/error, `aria-live` สำหรับ screen reader |
| `Card` | กล่อง surface + ขอบ + เงา |
