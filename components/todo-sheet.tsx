"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ListTodo,
  X,
  ArrowRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import type { TodoItem } from "@/lib/todo-types";

type TodoSheetProps = {
  todos: TodoItem[];
};

export function TodoSheet({ todos }: TodoSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      const saved = localStorage.getItem("appunti_completed_todos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCompletedIds(new Set(parsed));
        }
      }
    } catch {
      // Fallback
    }
  }, [isOpen]);

  const isCompleted = (item: TodoItem) => {
    const key = `${item.pageUrl}#${item.id}`;
    return item.status === "done" || completedIds.has(key);
  };

  const activeTodos = todos.filter((t) => !isCompleted(t));
  const activeCount = activeTodos.length;

  if (!mounted) {
    return (
      <div className="w-9 h-9 flex items-center justify-center">
        <ListTodo className="h-5 w-5 text-foreground/40" />
      </div>
    );
  }

  return (
    <>
      {/* Pulsante rapido nella Navbar */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-md hover:bg-primary/10 hover:text-primary transition-colors text-foreground/70"
        aria-label="Apri elenco cose da fare"
        title={`Cose da continuare: ${activeCount} rimanenti`}
      >
        <ListTodo className="h-5 w-5" />
        {activeCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs animate-in zoom-in-50">
            {activeCount > 99 ? "99+" : activeCount}
          </span>
        )}
      </button>

      {/* Overlay scuro */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 transition-opacity backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Pannello laterale (Sheet) */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background border-l border-gray-200 dark:border-gray-800 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Intestazione Sheet */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <ListTodo className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Cose da Continuare
              </h2>
              <p className="text-xs text-foreground/60">
                {activeCount} rimanent{activeCount === 1 ? "e" : "i"} su {todos.length} totali
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md hover:bg-primary/10 hover:text-primary transition-colors text-foreground/70"
            aria-label="Chiudi elenco"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo Sheet scrollabile */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {todos.length === 0 ? (
            <div className="text-center py-10 px-4 text-foreground/60">
              <ListTodo className="mx-auto h-8 w-8 text-foreground/30 mb-2" />
              <p className="text-sm font-medium">Nessun Todo presente</p>
              <p className="text-xs text-foreground/50 mt-1">
                Aggiungi <code className="font-mono text-primary">&lt;Todo&gt;</code> in qualsiasi dispensa per vederlo qui.
              </p>
            </div>
          ) : (
            todos.map((item) => {
              const done = isCompleted(item);
              const targetHref = `${item.pageUrl}#${item.id}`;

              return (
                <Link
                  key={`${item.pageUrl}#${item.id}`}
                  href={targetHref}
                  onClick={() => setIsOpen(false)}
                  className={`block p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-background/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left ${
                    done ? "opacity-50 bg-gray-50/40 dark:bg-gray-900/20" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : item.status === "in-progress" ? (
                        <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                      ) : item.priority === "alta" ? (
                        <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                      ) : (
                        <ListTodo className="h-4 w-4 text-primary shrink-0" />
                      )}
                      <span
                        className={`text-sm font-medium text-foreground truncate ${
                          done ? "line-through text-foreground/50" : ""
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 border ${
                        item.priority === "alta"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                          : item.priority === "bassa"
                          ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  {item.description && item.description !== item.title && (
                    <p className="mt-1 text-xs text-foreground/60 line-clamp-1">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-2 flex items-center justify-between text-[11px] text-foreground/50">
                    <span className="flex items-center gap-1 truncate">
                      <BookOpen size={11} className="shrink-0" />
                      <span className="truncate">{item.course} › {item.pageTitle}</span>
                    </span>
                    <span className="text-primary font-medium shrink-0 flex items-center gap-0.5 ml-2">
                      Vai alla nota →
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Footer Sheet con link alla pagina completa */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 shrink-0">
          <Link
            href="/Todo"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
          >
            <span>Apri pagina completa Cose da Fare</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </>
  );
}
