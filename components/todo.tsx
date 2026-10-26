"use client";

import React, { useState } from "react";
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertCircle,
  Link as LinkIcon,
  Check,
  Tag,
} from "lucide-react";
import { slugify } from "@/lib/todo-types";

// ─── TIPI DELLE PROPS ────────────────────────────────────────────────────────
export type TodoPriority = "alta" | "media" | "bassa" | "high" | "medium" | "low";
export type TodoStatus =
  | "todo"
  | "in-progress"
  | "done"
  | "in-corso"
  | "completato"
  | "da-fare";

export type TodoProps = {
  // ID opzionale per l'ancora HTML (#id). Se non fornito, viene generato dal titolo.
  id?: string;
  // Titolo della cosa da fare (es. "Completare dimostrazione")
  title?: string;
  // Testo o contenuto del TODO (supporta Markdown, liste, formule)
  children?: React.ReactNode;
  // Descrizione alternativa se non si usa children
  description?: string;
  // Livello di priorità ("alta", "media", "bassa")
  priority?: TodoPriority;
  // Stato corrente del lavoro ("todo", "in-progress", "done")
  status?: TodoStatus;
  // Etichetta o tag tematico (es. "Teoria", "Esercizi", "Laboratorio")
  tag?: string;
  category?: string;
  // Flag rapido per marcare il TODO come completato
  done?: boolean;
  completed?: boolean;
  // Flag per indicare esempi/template da non indicizzare esternamente
  demo?: boolean;
  example?: boolean;
  ignore?: boolean;
  // Classi Tailwind aggiuntive
  className?: string;
};

// ─── CONFIGURAZIONE GRAFICA DELLE PRIORITÀ ───────────────────────────────────
const PRIORITY_CONFIG = {
  alta: {
    label: "Priorità Alta",
    badge:
      "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    border: "border-l-rose-500",
  },
  media: {
    label: "Priorità Media",
    badge:
      "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    border: "border-l-amber-500",
  },
  bassa: {
    label: "Priorità Bassa",
    badge:
      "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
    border: "border-l-sky-500",
  },
};

// ─── COMPONENTE: Todo ────────────────────────────────────────────────────────
// Rappresenta un blocco "Da Fare / Continuare" da posizionare nelle dispense.
// Viene indicizzato automaticamente nella sezione globale /Todo del sito.
//
// UTILIZZO NEI FILE .mdx:
//   <Todo>
//     Completare la dimostrazione del Teorema di Bolzano
//   </Todo>
//
//   <Todo title="Esercizi laboratorio" priority="alta" tag="Esercizi">
//     Aggiungere i casi limite per gli array con elementi negativi.
//   </Todo>
//
//   <Todo title="Formulario integrali" priority="bassa" done />
export function Todo({
  id,
  title,
  children,
  description,
  priority = "media",
  status = "todo",
  tag,
  category,
  done = false,
  completed = false,
  className = "",
}: TodoProps) {
  const [copied, setCopied] = useState(false);

  // Normalizziamo i valori
  const isDone =
    done ||
    completed ||
    status === "done" ||
    status === "completato";

  const isInProgress =
    !isDone &&
    (status === "in-progress" ||
      status === "in-corso");

  const normalizedPrio: "alta" | "media" | "bassa" =
    priority === "alta" || priority === "high"
      ? "alta"
      : priority === "bassa" || priority === "low"
      ? "bassa"
      : "media";

  const prioConf = PRIORITY_CONFIG[normalizedPrio];
  const tagText = tag || category;
  const content = children || description;

  // Se non c'è un titolo esplicito, usiamo "Da completare" o il testo dei children
  const displayTitle =
    title ||
    (typeof children === "string" && children.length <= 60 && !children.includes("\n")
      ? children
      : "Da completare");

  // Calcoliamo l'ID ancora
  const elementId =
    id ||
    slugify(title || (typeof children === "string" ? children : "") || "todo");

  // Funzione per copiare il link diretto con ancora negli appunti
  const copyAnchorLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}#${elementId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silenzioso
    }
  };

  return (
    <div
      id={elementId}
      className={`not-prose group relative my-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-background/60 shadow-xs border-l-4 ${prioConf.border} p-4 transition-all hover:shadow-md scroll-mt-24 target:ring-2 target:ring-primary/60 target:ring-offset-2 dark:target:ring-offset-gray-950 ${
        isDone ? "opacity-75 bg-gray-50/50 dark:bg-gray-900/30" : ""
      } ${className}`}
    >
      {/* Intestazione del TODO */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Icona di stato */}
          {isDone ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          ) : isInProgress ? (
            <Clock className="h-5 w-5 text-amber-500 shrink-0 animate-pulse" />
          ) : normalizedPrio === "alta" ? (
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
          ) : (
            <ListTodo className="h-5 w-5 text-primary shrink-0" />
          )}

          {/* Titolo */}
          <span
            className={`font-semibold text-sm sm:text-base text-foreground truncate ${
              isDone ? "line-through text-foreground/60" : ""
            }`}
          >
            {displayTitle}
          </span>
        </div>

        {/* Badges e azioni */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Badge Tag */}
          {tagText && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-gray-100 dark:bg-gray-800 text-foreground/70 border border-gray-200 dark:border-gray-700">
              <Tag size={11} className="opacity-70" />
              {tagText}
            </span>
          )}

          {/* Badge Stato */}
          {isDone ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              Completato
            </span>
          ) : isInProgress ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30">
              In corso
            </span>
          ) : (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium border ${prioConf.badge}`}
            >
              {prioConf.label}
            </span>
          )}

          {/* Pulsante per copiare il link all'ancora */}
          <button
            onClick={copyAnchorLink}
            aria-label="Copia link diretto"
            title={copied ? "Link copiato!" : "Copia link diretto alla nota"}
            className="p-1 rounded-md text-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors ml-1"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <LinkIcon className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Corpo / Descrizione del TODO */}
      {content && (!title || content !== title) && (
        <div
          className={`mt-2.5 text-sm text-foreground/80 leading-relaxed prose dark:prose-invert max-w-none ${
            isDone ? "line-through text-foreground/50" : ""
          }`}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// Alias in lingua italiana per comodità
export const DaFare = Todo;
