"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  ArrowUpRight,
  BookOpen,
  Tag,
  Check,
  RotateCcw,
  Layers,
  List,
} from "lucide-react";
import type { TodoItem, TodoPriority } from "@/lib/todo-types";

type TodoDashboardProps = {
  initialTodos: TodoItem[];
};

export function TodoDashboard({ initialTodos }: TodoDashboardProps) {
  const [todos] = useState<TodoItem[]>(initialTodos);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [groupByCourse, setGroupByCourse] = useState(true);

  // ID dei todo completati localmente via checkbox
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  // Carica i todo spuntati da localStorage al mount
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
      // Ignora errori di parsing
    }
  }, []);

  // Salva i todo spuntati su localStorage
  const toggleTodoDone = (uniqueKey: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(uniqueKey)) {
        next.delete(uniqueKey);
      } else {
        next.add(uniqueKey);
      }
      try {
        localStorage.setItem(
          "appunti_completed_todos",
          JSON.stringify(Array.from(next))
        );
      } catch {
        // Fallback
      }
      return next;
    });
  };

  // Resetta tutti i todo spuntati localmente
  const resetLocalCompleted = () => {
    if (confirm("Vuoi ripristinare lo stato di tutti i TODO completati nel browser?")) {
      setCompletedIds(new Set());
      try {
        localStorage.removeItem("appunti_completed_todos");
      } catch {
        // Fallback
      }
    }
  };

  // Lista di tutti i corsi unici
  const courses = useMemo(() => {
    const list = Array.from(new Set(todos.map((t) => t.course))).filter(Boolean);
    return list.sort();
  }, [todos]);

  // Calcola lo stato effettivo di ciascun todo (tenendo conto sia del codice che di localStorage)
  const isItemCompleted = useCallback(
    (item: TodoItem) => {
      const uniqueKey = `${item.pageUrl}#${item.id}`;
      return item.status === "done" || completedIds.has(uniqueKey);
    },
    [completedIds]
  );

  // Statistiche globali
  const stats = useMemo(() => {
    const total = todos.length;
    let completedCount = 0;
    let highPrioPending = 0;
    let inProgressCount = 0;

    for (const item of todos) {
      const done = isItemCompleted(item);
      if (done) {
        completedCount++;
      } else {
        if (item.priority === "alta") highPrioPending++;
        if (item.status === "in-progress") inProgressCount++;
      }
    }

    const pendingCount = total - completedCount;
    const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return {
      total,
      completedCount,
      pendingCount,
      highPrioPending,
      inProgressCount,
      progressPercent,
      coursesCount: courses.length,
    };
  }, [todos, courses, isItemCompleted]);

  // Filtraggio dei todo
  const filteredTodos = useMemo(() => {
    return todos.filter((item) => {
      const done = isItemCompleted(item);

      // Filtro ricerca testuale
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesPage = item.pageTitle.toLowerCase().includes(q);
        const matchesCourse = item.course.toLowerCase().includes(q);
        const matchesTag = item.tag?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesPage && !matchesCourse && !matchesTag) {
          return false;
        }
      }

      // Filtro per Corso
      if (courseFilter !== "all" && item.course !== courseFilter) {
        return false;
      }

      // Filtro per Priorità
      if (priorityFilter !== "all" && item.priority !== priorityFilter) {
        return false;
      }

      // Filtro per Stato
      if (statusFilter === "done" && !done) return false;
      if (statusFilter === "todo" && done) return false;
      if (statusFilter === "in-progress" && (done || item.status !== "in-progress")) return false;

      return true;
    });
  }, [todos, search, courseFilter, priorityFilter, statusFilter, isItemCompleted]);

  // Raggruppamento per Corso
  const groupedTodos = useMemo(() => {
    const map = new Map<string, TodoItem[]>();
    for (const item of filteredTodos) {
      const current = map.get(item.course) || [];
      current.push(item);
      map.set(item.course, current);
    }
    return Array.from(map.entries());
  }, [filteredTodos]);

  return (
    <div className="not-prose space-y-8 pb-16">
      {/* ─── HEADER DELLA SEZIONE ────────────────────────────────────────── */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <ListTodo className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                Cose da Continuare
              </h1>
            </div>
            <p className="mt-2 text-sm sm:text-base text-foreground/70 max-w-2xl">
              Tutti i promemoria, dimostrazioni da completare, esercizi e note di lavoro inseriti
              con il tag <code className="text-xs bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-primary">&lt;Todo /&gt;</code> nelle varie dispense del sito.
            </p>
          </div>

          {completedIds.size > 0 && mounted && (
            <button
              onClick={resetLocalCompleted}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 dark:border-gray-800 text-foreground/60 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Resetta le caselle spuntate localmente"
            >
              <RotateCcw size={13} />
              Ripristina spunte ({completedIds.size})
            </button>
          )}
        </div>

        {/* ─── METRICHE STATISTICHE ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {/* Card 1: Rimanenti */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-background/50 shadow-2xs">
            <div className="text-xs font-medium text-foreground/60 flex items-center justify-between">
              <span>Da completare</span>
              <ListTodo size={14} className="text-primary" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">
                {stats.pendingCount}
              </span>
              <span className="text-xs text-foreground/50">su {stats.total} totali</span>
            </div>
            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500 rounded-full"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Card 2: Priorità Alta */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-background/50 shadow-2xs">
            <div className="text-xs font-medium text-foreground/60 flex items-center justify-between">
              <span>Priorità Alta</span>
              <AlertCircle size={14} className="text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-rose-500">
                {stats.highPrioPending}
              </span>
              <span className="text-xs text-foreground/50">urgenti</span>
            </div>
            <p className="mt-3 text-[11px] text-foreground/50">Richiedono attenzione immediata</p>
          </div>

          {/* Card 3: In Corso */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-background/50 shadow-2xs">
            <div className="text-xs font-medium text-foreground/60 flex items-center justify-between">
              <span>In lavorazione</span>
              <Clock size={14} className="text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-amber-500">
                {stats.inProgressCount}
              </span>
              <span className="text-xs text-foreground/50">iniziati</span>
            </div>
            <p className="mt-3 text-[11px] text-foreground/50">Bozze già avviate</p>
          </div>

          {/* Card 4: Completati */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-background/50 shadow-2xs">
            <div className="text-xs font-medium text-foreground/60 flex items-center justify-between">
              <span>Completati</span>
              <CheckCircle2 size={14} className="text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-500">
                {stats.completedCount}
              </span>
              <span className="text-xs text-foreground/50">({stats.progressPercent}%)</span>
            </div>
            <p className="mt-3 text-[11px] text-foreground/50">Progresso completamento</p>
          </div>
        </div>
      </div>

      {/* ─── FILTRI E BARRA DI RICERCA ───────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Cerca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca per titolo, argomento, dispensa o tag..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-foreground/40 hover:text-foreground p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Toggle visualizzazione: raggruppata vs elenco */}
          <div className="flex items-center gap-1 p-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-background/40 self-end sm:self-auto shrink-0">
            <button
              onClick={() => setGroupByCourse(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                groupByCourse
                  ? "bg-primary text-white shadow-xs"
                  : "text-foreground/60 hover:text-foreground"
              }`}
              title="Raggruppa per Materia"
            >
              <Layers size={13} />
              <span className="hidden sm:inline">Per Materia</span>
            </button>
            <button
              onClick={() => setGroupByCourse(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                !groupByCourse
                  ? "bg-primary text-white shadow-xs"
                  : "text-foreground/60 hover:text-foreground"
              }`}
              title="Elenco Sequenziale"
            >
              <List size={13} />
              <span className="hidden sm:inline">Elenco Singolo</span>
            </button>
          </div>
        </div>

        {/* Dropdown / Bottoni Filtro */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-foreground/50 mr-1">
            <Filter size={13} />
            <span className="font-medium">Filtra per:</span>
          </div>

          {/* Filtro Corso */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-800 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">Tutte le materie ({todos.length})</option>
            {courses.map((c) => (
              <option key={c} value={c}>
                {c} ({todos.filter((t) => t.course === c).length})
              </option>
            ))}
          </select>

          {/* Filtro Priorità */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-800 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">Tutte le priorità</option>
            <option value="alta">Priorità Alta</option>
            <option value="media">Priorità Media</option>
            <option value="bassa">Priorità Bassa</option>
          </select>

          {/* Filtro Stato */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-gray-200 dark:border-gray-800 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">Tutti gli stati</option>
            <option value="todo">Da fare</option>
            <option value="in-progress">In corso</option>
            <option value="done">Completati</option>
          </select>

          {/* Reset Filtri */}
          {(search || courseFilter !== "all" || priorityFilter !== "all" || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setCourseFilter("all");
                setPriorityFilter("all");
                setStatusFilter("all");
              }}
              className="px-2 py-1 text-primary hover:underline font-medium ml-auto"
            >
              Azzera filtri
            </button>
          )}
        </div>
      </div>

      {/* ─── ELENCO DEI TODO ─────────────────────────────────────────────── */}
      {filteredTodos.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-800 bg-background/30">
          <ListTodo className="mx-auto h-10 w-10 text-foreground/30 mb-3" />
          <h3 className="text-base font-semibold text-foreground">
            Nessun elemento trovato
          </h3>
          <p className="mt-1 text-sm text-foreground/60 max-w-sm mx-auto">
            {todos.length === 0
              ? "Non ci sono ancora elementi <Todo> inseriti nelle tue dispense. Aggiungine uno nei file .mdx per vederlo qui!"
              : "Nessun Todo corrisponde ai criteri di ricerca e ai filtri selezionati."}
          </p>

          {todos.length === 0 && (
            <div className="mt-5 max-w-md mx-auto text-left p-3.5 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs font-mono">
              <p className="text-foreground/50 mb-1 font-sans font-semibold">Esempio d&apos;uso nel tuo file .mdx:</p>
              <pre className="text-primary overflow-x-auto">
{`<Todo title="Completare dimostrazione" priority="alta">
  Inserire passaggi algebrici mancanti.
</Todo>`}
              </pre>
            </div>
          )}
        </div>
      ) : groupByCourse ? (
        /* VISTA RAGGRUPPATA PER CORSO */
        <div className="space-y-8">
          {groupedTodos.map(([courseName, items]) => {
            const coursePending = items.filter((i) => !isItemCompleted(i)).length;

            return (
              <div
                key={courseName}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-background/40 overflow-hidden shadow-2xs"
              >
                {/* Intestazione del gruppo */}
                <div className="px-5 py-3.5 bg-gray-50/70 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <BookOpen size={16} className="text-primary shrink-0" />
                    <h2 className="font-bold text-base text-foreground capitalize">
                      {courseName}
                    </h2>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {coursePending} rimanent{coursePending === 1 ? "e" : "i"} ({items.length} totali)
                  </span>
                </div>

                {/* Lista card */}
                <div className="divide-y divide-gray-100 dark:divide-gray-850">
                  {items.map((item) => (
                    <TodoCard
                      key={`${item.pageUrl}#${item.id}`}
                      item={item}
                      isDone={isItemCompleted(item)}
                      onToggleDone={() => toggleTodoDone(`${item.pageUrl}#${item.id}`)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VISTA ELENCO SEQUENZIALE */
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-background/40 overflow-hidden shadow-2xs divide-y divide-gray-100 dark:divide-gray-850">
          {filteredTodos.map((item) => (
            <TodoCard
              key={`${item.pageUrl}#${item.id}`}
              item={item}
              isDone={isItemCompleted(item)}
              onToggleDone={() => toggleTodoDone(`${item.pageUrl}#${item.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CARD SINGOLO TODO ────────────────────────────────────────────────────────
function TodoCard({
  item,
  isDone,
  onToggleDone,
}: {
  item: TodoItem;
  isDone: boolean;
  onToggleDone: () => void;
}) {
  const isInProgress = !isDone && item.status === "in-progress";

  const prioBadges: Record<TodoPriority, { label: string; badge: string }> = {
    alta: {
      label: "Alta",
      badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    },
    media: {
      label: "Media",
      badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    },
    bassa: {
      label: "Bassa",
      badge: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
    },
  };

  const prio = prioBadges[item.priority];
  const targetHref = `${item.pageUrl}#${item.id}`;

  return (
    <div
      className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/30 ${
        isDone ? "opacity-60 bg-gray-50/30 dark:bg-gray-900/20" : ""
      }`}
    >
      {/* Sinistra: Checkbox e Contenuto */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Checkbox interattiva */}
        <button
          onClick={onToggleDone}
          aria-label={isDone ? "Segna come da fare" : "Segna come completato"}
          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
            isDone
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-primary/5"
          }`}
        >
          {isDone && <Check size={13} strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          {/* Titolo e Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`font-semibold text-sm sm:text-base text-foreground break-words ${
                isDone ? "line-through text-foreground/60" : ""
              }`}
            >
              {item.title}
            </h3>

            {/* Badge priorità */}
            <span
              className={`text-[11px] font-medium px-2 py-0.2 rounded-full border ${prio.badge}`}
            >
              {prio.label}
            </span>

            {/* Badge stato */}
            {isDone ? (
              <span className="text-[11px] font-medium px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                Fatto
              </span>
            ) : isInProgress ? (
              <span className="text-[11px] font-medium px-2 py-0.2 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                In corso
              </span>
            ) : null}

            {/* Badge tag */}
            {item.tag && (
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-foreground/70 border border-gray-200 dark:border-gray-700 flex items-center gap-1">
                <Tag size={10} className="opacity-70" />
                {item.tag}
              </span>
            )}
          </div>

          {/* Descrizione (se presente) */}
          {item.description && item.description !== item.title && (
            <p
              className={`mt-1 text-xs sm:text-sm text-foreground/70 leading-relaxed line-clamp-2 ${
                isDone ? "line-through text-foreground/50" : ""
              }`}
            >
              {item.description}
            </p>
          )}

          {/* Percorso dispensa (breadcrumbs) */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-foreground/50">
            <span className="font-medium text-foreground/70">{item.pageTitle}</span>
            <span>•</span>
            <span className="truncate">{item.breadcrumbs.join(" › ")}</span>
            {item.lineNumber && (
              <>
                <span>•</span>
                <span className="font-mono text-[11px]">riga {item.lineNumber}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Destra: Pulsante Vai alla Dispensa */}
      <div className="shrink-0 self-end sm:self-center pl-8 sm:pl-0">
        <Link
          href={targetHref}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-2xs group"
        >
          <span>Vai alla dispensa</span>
          <ArrowUpRight
            size={13}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>
    </div>
  );
}
