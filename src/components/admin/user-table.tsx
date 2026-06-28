"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Skeleton from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

type User = {
  id: string;
  email: string;
  name: string;
  imageUrl: string;
  role: string;
  taskCount: number;
};

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) setUsers(data);
      } catch {
        if (!cancelled) toast("Failed to load users", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleRole = async (user: User) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    setTogglingId(user.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: user.id, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Failed to update role", "error");
        return;
      }
      toast(`${user.name} is now ${newRole}`);
      const refreshRes = await fetch("/api/admin/users");
      if (refreshRes.ok) setUsers(await refreshRes.json());
      router.refresh();
    } catch {
      toast("Failed to update role", "error");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">No users found</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-muted">
            <tr>
              <th className="text-left px-4 py-3 font-medium">User</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-center px-4 py-3 font-medium">Tasks</th>
              <th className="text-center px-4 py-3 font-medium">Role</th>
              <th className="text-center px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user.imageUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{user.email}</td>
                <td className="px-4 py-3 text-center">{user.taskCount}</td>
                <td className="px-4 py-3 text-center">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-4 py-3 text-center">
                  <Button
                    variant={user.role === "admin" ? "danger" : "primary"}
                    loading={togglingId === user.id}
                    onClick={() => toggleRole(user)}
                    className="text-xs px-3 py-1"
                  >
                    {user.role === "admin" ? "Demote" : "Promote"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="border border-border rounded-lg bg-surface p-4 animate-fade-in"
          >
            <div className="flex items-center gap-3 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.imageUrl}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-muted text-xs truncate">{user.email}</p>
              </div>
              <RoleBadge role={user.role} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted text-sm">{user.taskCount} tasks</span>
              <Button
                variant={user.role === "admin" ? "danger" : "primary"}
                loading={togglingId === user.id}
                onClick={() => toggleRole(user)}
                className="text-xs px-3 py-1"
              >
                {user.role === "admin" ? "Demote" : "Promote"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
        role === "admin"
          ? "bg-primary/15 text-primary"
          : "bg-surface-2 text-muted"
      }`}
    >
      {role}
    </span>
  );
}
