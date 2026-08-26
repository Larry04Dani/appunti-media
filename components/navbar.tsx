import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <nav className="relative z-50 bg-background flex items-center justify-between py-4 mb-8 border-b border-gray-200 dark:border-gray-800 not-prose">
      <div className="flex items-center gap-6">
        <Link 
          href="/" 
          className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          Appunti
        </Link>
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-400">
          <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            Home
          </Link>
          <Link href="/About" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            About
          </Link>
          <Link href="/Templates" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            Templates
          </Link>
          {/* Aggiungi altri link qui */}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </nav>
  );
}
