import { Link, Outlet } from "react-router-dom";

import { ThemeToggle } from "@/components/shared/theme-toggle";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <span className="font-semibold">Boilerplate</span>
            <nav>
              <Link
                to="/"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Home
              </Link>
            </nav>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <Outlet />
      </main>
      <footer className="border-t">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 text-sm text-muted-foreground">
          Built with React, Vite, and Tailwind CSS.
        </div>
      </footer>
    </div>
  );
}
