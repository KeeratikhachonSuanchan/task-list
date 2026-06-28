import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import UserTable from "@/components/admin/user-table";

export default async function AdminPage() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") redirect("/");

  return (
    <main className="max-w-4xl mx-auto mt-6 md:mt-10 p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold mb-6">User Management</h1>
      <UserTable />
    </main>
  );
}
