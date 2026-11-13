import { Link, NavLink, Outlet } from "react-router-dom";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "text-sm transition-colors",
    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
  );

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
              <span className="size-2.5 bg-foreground" aria-hidden="true" />
              Boilerplate
            </Link>
            <nav className="flex items-center gap-6">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              {import.meta.env.DEV ? (
                <NavLink to="/_gallery" className={navLinkClass}>
                  Gallery
                </NavLink>
              ) : null}
            </nav>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-6 py-12 sm:py-16">
        <Outlet />
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto w-full max-w-[1120px] px-6 py-8 text-sm text-muted-foreground">
          Go, Postgres, and React, wired together.
        </div>
      </footer>
    </div>
  );
}
