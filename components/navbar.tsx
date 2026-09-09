import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { SettingsSheet } from "./settings-sheet";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-gray-200 dark:border-gray-800 h-[var(--navbar-h)]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full not-prose">
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="text-xl font-bold text-foreground hover:text-primary transition-colors"
          >
            Appunti
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-foreground/70">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/About" className="hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/Templates" className="hover:text-primary transition-colors">
              Templates
            </Link>
            {/* Aggiungi altri link qui */}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SettingsSheet />
        </div>
      </nav>
    </header>
  );
}
