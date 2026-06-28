import { SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import NavMenu from "./nav-menu";

export default async function Header() {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const isAdmin = role === "admin";

  const authSlot = userId ? (
    <UserButton />
  ) : (
    <SignInButton mode="modal">
      <button className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        Login
      </button>
    </SignInButton>
  );

  return (
    <header className="relative w-full border-b border-border bg-surface">
      <div className="max-w-3xl mx-auto px-4 py-3 md:px-6 flex items-center justify-between">
        <Link href="/" className="font-bold text-base md:text-lg">
          Task List
        </Link>
        <NavMenu userId={userId} isAdmin={isAdmin} authSlot={authSlot} />
      </div>
    </header>
  );
}
