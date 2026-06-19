"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/lib/schema";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [editError, setEditError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const getTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch {
      setError("Failed to load tasks");
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
    } catch {
      setError("Failed to connect to server");
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
    } catch {
      setError("Failed to update task");
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
    } catch {
      setError("Failed to delete task");
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
    } catch {
      setEditError("Failed to update task");
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  return (
    <main className="w-lg mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">My Task List</h1>

      {/* Add Task */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a new task..."
          className="flex-1 border rounded-lg px-4 py-2 text-sm"
        />
        <button
          onClick={addTask}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Task List */}
      <ul className="space-y-2 mt-4">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 border rounded-lg px-4 py-3 text-sm"
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleDone(task.id, task.done)}
              className="w-4 h-4 cursor-pointer"
            />

            {/* Title or Edit Input */}
            {editingId === task.id ? (
              <div className="flex-1">
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="flex-1 border rounded px-2 py-1 text-sm"
                  autoFocus
                />
                {editError && (
                  <p className="text-red-500 text-xs mt-1">{editError}</p> // ← แสดง error ใต้ input
                )}
              </div>
            ) : (
              <span
                className={`flex-1 ${task.done ? "text-green-500" : "text-yellow-500"}`}
              >
                <span className={task.done ? "line-through" : ""}>
                  {task.title}
                </span>{" "}
                {task.done ? "(Completed)" : "(Pending)"}
              </span>
            )}
            {/* Buttons */}
            {editingId === task.id ? (
              <>
                <button
                  onClick={() => saveEdit(task.id)}
                  className="text-green-500 hover:text-green-700 hover:font-bold text-xs cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => startEdit(task)}
                  className="text-blue-400 hover:text-blue-600 hover:font-bold text-xs cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-400 hover:text-red-600 hover:font-bold text-xs cursor-pointer"
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}