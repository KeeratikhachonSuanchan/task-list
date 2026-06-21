import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Header() {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as {role?: string })?.role;
  const isAdmin = role === "admin";

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-3xl mx-auto px-4 py-3 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-base md:text-lg">
          Task List
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-2 md:gap-4 text-sm">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>

          {userId ? (
            // Already login.
            <>
              {isAdmin && (
                <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                  Admin
                </Link>
              )}
              <UserButton />
            </>
          ) : (
            // Not login yet.
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-500">
                Login
              </button>
            </SignInButton>
          )}
        </nav>
      </div>
    </header>
  );
}