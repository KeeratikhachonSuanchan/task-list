"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ThemeToggle from "./theme-toggle";

export default function NavMenu({
  userId,
  isAdmin,
  authSlot,
}: {
  userId: string | null;
  isAdmin: boolean;
  authSlot: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-4 text-sm">
        <Link href="/" className="text-muted hover:text-foreground transition-colors">
          Home
        </Link>
        {userId && isAdmin && (
          <Link href="/admin" className="text-muted hover:text-foreground transition-colors">
            Admin
          </Link>
        )}
        <ThemeToggle />
        {authSlot}
      </nav>
        
      {/* Mobile: hamburger button */}
      <button
        className="md:hidden p-2 rounded-md text-muted hover:text-foreground hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Mobile menu dropdown */}
      {open && (
        <div
          ref={menuRef}
          className="absolute top-full left-0 right-0 md:hidden bg-surface border-b border-border shadow-card animate-fade-in-down"
        >
          <nav className="max-w-3xl mx-auto flex flex-col p-4 gap-2">
            <Link
              href="/"
              onClick={closeMenu}
              className="px-3 py-2 rounded-md text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
            >
              Home
            </Link>
            {userId && isAdmin && (
              <Link
                href="/admin"
                onClick={closeMenu}
                className="px-3 py-2 rounded-md text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
              >
                Admin
              </Link>
            )}
            <div className="flex items-center justify-between px-3 py-2">
              {authSlot}
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
