"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/lib/schema";
import { useAuth } from "@clerk/nextjs";
import Skeleton from "@/components/ui/skeleton";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [editError, setEditError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { userId, sessionClaims } = useAuth();
  const role = (sessionClaims?.metadata as {role?: string })?.role;
  const isAdmin = role === "admin";
  const toast = useToast();

  const getTasks = async () => {
    setLoadingTasks(true);
    setLoadError(false);
    try {
      const res = await fetch("/api/tasks");

      if (!res.ok) {
        setTasks([]);
        return;
      }

      const data = await res.json();
      setTasks(data);
    } catch {
      setLoadError(true);
    } finally {
      setLoadingTasks(false);
    }
  };

  const addTask = async () => {
    setError("");

    if (!title.trim()) {
      setError("Please enter a task title");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setTitle("");
      getTasks();
      toast("Task added");
    } catch {
      toast("Failed to connect to server", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleDone = async (id: number, done: boolean) => {
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, done: !done }),
      });
      getTasks();
      toast("Task updated");
    } catch {
      toast("Failed to update task", "error");
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      getTasks();
      toast("Task deleted");
    } catch {
      toast("Failed to delete task", "error");
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
    setError("");
    setEditError("");
  };

  const saveEdit = async (id: number) => {
    setEditError("");
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title: editingTitle }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "Something went wrong");
        return;
      }
      setEditingId(null);
      setEditingTitle("");
      getTasks();
      toast("Task saved");
    } catch {
      toast("Failed to update task", "error");
    }
  };

  useEffect(() => {
    if (userId) { // When login.
      getTasks(); 
    } else { // When logout or Not login yet.
      setTasks([]);
      setLoadingTasks(false);
    }
  }, [userId]);

  return (
    <main className="max-w-3xl mx-auto mt-6 md:mt-10 p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold mb-6 text-center">{isAdmin ? "All Task List" : "My Task List"} </h1>

      <Card className="p-4 md:p-6">
        {/* Add Task */}
        {!isAdmin && (
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Add a new task..."
              aria-label="New task"
              className="flex-1"
            />
            <Button onClick={addTask} loading={loading}>
              Add
            </Button>
          </div>
        )}

        {/* Error Message */}
        {error && <p className="text-danger text-sm mb-4">{error}</p>}

        {/* Task List */}
        {loadingTasks ? (
          <ul className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </ul>
        ) : loadError ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-foreground font-medium">Failed to load tasks</p>
            <p className="text-muted text-sm mt-1">Something went wrong. Please try again.</p>
            <Button variant="primary" onClick={getTasks} className="mt-4">
              Retry
            </Button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-foreground font-medium">No tasks yet</p>
            <p className="text-muted text-sm mt-1">Add your first task to get started!</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-3 border border-border rounded-lg px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm animate-fade-in"
              >
                {/* Checkbox */}
                {!isAdmin && (
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleDone(task.id, task.done)}
                    className="w-4 h-4 cursor-pointer"
                  />
                )}

                {/* Title or Edit Input */}
                {editingId === task.id ? (
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      aria-label="Edit task"
                      autoFocus
                    />
                    {editError && (
                      <p className="text-danger text-xs mt-1">{editError}</p>
                    )}
                  </div>
                ) : (
                  <span
                    className={`flex-1 ${task.done ? "text-success" : "text-warning"}`}
                  >
                    <span className={task.done ? "line-through" : ""}>
                      {task.title}
                    </span>{" "}
                    {task.done ? "(Completed)" : "(Pending)"}
                  </span>
                )}
                {/* Buttons */}
                {!isAdmin && (
                  editingId === task.id ? (
                    <>
                      <Button variant="ghost" className="text-success px-2 py-1" onClick={() => saveEdit(task.id)}>Save</Button>
                      <Button variant="ghost" className="px-2 py-1" onClick={cancelEdit}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" className="px-2 py-1" onClick={() => startEdit(task)}>Edit</Button>
                      <Button variant="ghost" className="text-danger px-2 py-1" onClick={() => deleteTask(task.id)}>Delete</Button>
                    </>
                  )
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </main>
  );
}
