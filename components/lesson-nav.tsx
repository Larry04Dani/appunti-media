"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNotesTree } from "@/components/notes-tree-provider";
import type { TreeNode } from "@/lib/get-notes-tree";

// ─── TIPI E INTERFACCE ────────────────────────────────────────────────────────
export type LessonItem = {
  href: string;
  title: string;
  text?: string;
  label?: string;
};

export type LessonNavProps = {
  prev?: LessonItem;
  next?: LessonItem;
  variant?: "card" | "button";
  className?: string;
  children?: React.ReactNode;
};

export type SingleLessonProps = {
  href?: string;
  title?: string;
  text?: string;
  label?: string;
  variant?: "card" | "button";
  className?: string;
  children?: React.ReactNode;
};

// ─── HELPER: APPIATTIMENTO ALBERO DELLE NOTE ──────────────────────────────────
// Estrae ordinatamente tutte le pagine effettive dell'albero delle note
function flattenTree(nodes: TreeNode[]): { name: string; url: string }[] {
  const list: { name: string; url: string }[] = [];
  function walk(items: TreeNode[]) {
    for (const item of items) {
      if (item.url) {
        list.push({ name: item.name, url: item.url });
      }
      if (item.children) {
        walk(item.children);
      }
    }
  }
  walk(nodes);
  return list;
}

// ─── HOOK: CALCOLO AUTOMATICO LEZIONE PRECEDENTE / SUCCESSIVA ─────────────────
function useAutoLessonNavigation(): { prev?: LessonItem; next?: LessonItem } {
  const tree = useNotesTree();
  const pathname = usePathname();

  return useMemo(() => {
    if (!tree || tree.length === 0 || !pathname) {
      return { prev: undefined, next: undefined };
    }
    const flatPages = flattenTree(tree);
    const currentIndex = flatPages.findIndex(
      (p) => p.url.toLowerCase() === pathname.toLowerCase()
    );

    if (currentIndex === -1) {
      return { prev: undefined, next: undefined };
    }

    const prev =
      currentIndex > 0
        ? {
            href: flatPages[currentIndex - 1].url,
            title: flatPages[currentIndex - 1].name,
          }
        : undefined;

    const next =
      currentIndex < flatPages.length - 1
        ? {
            href: flatPages[currentIndex + 1].url,
            title: flatPages[currentIndex + 1].name,
          }
        : undefined;

    return { prev, next };
  }, [tree, pathname]);
}

// ─── COMPONENTE: NextLesson (ProssimaLezione) ──────────────────────────────────
export function NextLesson({
  href,
  title,
  text,
  label,
  variant = "card",
  className = "",
  children,
}: SingleLessonProps) {
  const auto = useAutoLessonNavigation();

  const effectiveHref = href || auto.next?.href;
  const effectiveTitle =
    title || (typeof children === "string" ? children : undefined) || auto.next?.title;
  const subLabel = text || label || "Prossima lezione";

  if (!effectiveHref) return null;

  const isExternal =
    effectiveHref.startsWith("http://") || effectiveHref.startsWith("https://");

  const content =
    variant === "button" ? (
      <span
        className={`not-prose inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white font-medium text-sm transition-all duration-200 group shadow-xs hover:shadow-sm cursor-pointer ${className}`}
      >
        <span className="truncate">
          {effectiveTitle || children || subLabel}
        </span>
        <ArrowRight
          size={16}
          className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
        />
      </span>
    ) : (
      <div
        className={`not-prose group flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-zinc-900/40 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer ${className}`}
      >
        <div className="flex flex-col text-right flex-1 min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
            {subLabel}
          </span>
          <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate mt-0.5">
            {effectiveTitle || children || subLabel}
          </span>
        </div>
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
          <ArrowRight
            size={18}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </div>
      </div>
    );

  if (isExternal) {
    return (
      <a
        href={effectiveHref}
        target="_blank"
        rel="noopener noreferrer"
        className="no-underline block"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={effectiveHref} className="no-underline block">
      {content}
    </Link>
  );
}

// ─── COMPONENTE: PrevLesson (LezionePrecedente) ────────────────────────────────
export function PrevLesson({
  href,
  title,
  text,
  label,
  variant = "card",
  className = "",
  children,
}: SingleLessonProps) {
  const auto = useAutoLessonNavigation();

  const effectiveHref = href || auto.prev?.href;
  const effectiveTitle =
    title || (typeof children === "string" ? children : undefined) || auto.prev?.title;
  const subLabel = text || label || "Lezione precedente";

  if (!effectiveHref) return null;

  const isExternal =
    effectiveHref.startsWith("http://") || effectiveHref.startsWith("https://");

  const content =
    variant === "button" ? (
      <span
        className={`not-prose inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white font-medium text-sm transition-all duration-200 group shadow-xs hover:shadow-sm cursor-pointer ${className}`}
      >
        <ArrowLeft
          size={16}
          className="shrink-0 transition-transform duration-200 group-hover:-translate-x-1"
        />
        <span className="truncate">
          {effectiveTitle || children || subLabel}
        </span>
      </span>
    ) : (
      <div
        className={`not-prose group flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-zinc-900/40 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer ${className}`}
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
          <ArrowLeft
            size={18}
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />
        </div>
        <div className="flex flex-col text-left flex-1 min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
            {subLabel}
          </span>
          <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate mt-0.5">
            {effectiveTitle || children || subLabel}
          </span>
        </div>
      </div>
    );

  if (isExternal) {
    return (
      <a
        href={effectiveHref}
        target="_blank"
        rel="noopener noreferrer"
        className="no-underline block"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={effectiveHref} className="no-underline block">
      {content}
    </Link>
  );
}

// ─── COMPONENTE: LessonNav (NavigazioneLezioni) ────────────────────────────────
export function LessonNav({
  prev,
  next,
  variant = "card",
  className = "",
  children,
}: LessonNavProps) {
  const auto = useAutoLessonNavigation();

  // Se l'utente ha fornito figli JSX personalizzati
  if (children) {
    return (
      <div
        className={`not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-8 ${className}`}
      >
        {children}
      </div>
    );
  }

  const effectivePrev = prev || auto.prev;
  const effectiveNext = next || auto.next;

  if (!effectivePrev && !effectiveNext) return null;

  return (
    <nav
      aria-label="Navigazione lezioni"
      className={`not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-8 ${className}`}
    >
      {effectivePrev ? (
        <PrevLesson
          href={effectivePrev.href}
          title={effectivePrev.title}
          text={effectivePrev.text || effectivePrev.label}
          variant={variant}
        />
      ) : (
        // Spacer vuoto su schermi desktop se non c'è la lezione precedente
        <div className="hidden sm:block" aria-hidden="true" />
      )}

      {effectiveNext && (
        <div className={!effectivePrev ? "sm:col-start-2" : ""}>
          <NextLesson
            href={effectiveNext.href}
            title={effectiveNext.title}
            text={effectiveNext.text || effectiveNext.label}
            variant={variant}
          />
        </div>
      )}
    </nav>
  );
}

// ─── ALIAS ITALIANI PER COMODITÀ NEI FILE MDX ────────────────────────────────
export const ProssimaLezione = NextLesson;
export const LezionePrecedente = PrevLesson;
export const NavigazioneLezioni = LessonNav;
