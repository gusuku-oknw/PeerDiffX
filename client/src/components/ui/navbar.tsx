import { Link } from "wouter";
import { AuthButtons } from "./auth-buttons";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const { isAdmin } = useAdmin();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
            <span className="hidden font-bold sm:inline-block">
              PeerDiffX
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-6">
            {isAuthenticated && (
              <>
                <Link
                  href="/presentations"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Presentations
                </Link>
                <Link
                  href="/student/dashboard"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  学生ダッシュボード
                </Link>
                <Link
                  href="/corporate/dashboard"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  企業ダッシュボード
                </Link>
                {isAdmin && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                    管理者
                  </span>
                )}
                <Link
                  href="/history"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  History
                </Link>
                <Link
                  href="/branches"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Branches
                </Link>
              </>
            )}
          </nav>
          <div className="flex items-center space-x-2">
            <AuthButtons />
          </div>
        </div>
      </div>
    </header>
  );
}