"use client";

import React from "react";
// Importiamo le icone da Lucide React (già installato nel progetto).
// Ogni tipo di callout usa un'icona diversa invece delle emoji.
// Risorsa: https://lucide.dev/icons/
import {
  BookOpen,    // definizione
  Zap,         // teorema
  PenLine,     // dimostrazione
  TriangleAlert, // attenzione
  Pin,         // nota
  Search,      // esempio
  type LucideIcon,
} from "lucide-react";

// ─── MAPPA DEI TIPI DI CALLOUT ───────────────────────────────────────────────
// Ogni tipo ha: un componente icona Lucide, colori e il titolo di default.
// Il campo `icon` ora è di tipo `LucideIcon` (un componente React, non una stringa).
// Per aggiungere un nuovo tipo, importa l'icona qui sopra e aggiungi una riga!
const CALLOUT_TYPES: Record<
  string,
  { icon: LucideIcon; iconColor: string; borderColor: string; bgColor: string; defaultTitle: string }
> = {
  definizione: {
    icon: BookOpen,
    iconColor: "text-blue-500",
    borderColor: "border-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    defaultTitle: "Definizione",
  },
  teorema: {
    icon: Zap,
    iconColor: "text-purple-500",
    borderColor: "border-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/40",
    defaultTitle: "Teorema",
  },
  dimostrazione: {
    icon: PenLine,
    iconColor: "text-gray-500",
    borderColor: "border-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-900/60",
    defaultTitle: "Dimostrazione",
  },
  attenzione: {
    icon: TriangleAlert,
    iconColor: "text-yellow-500",
    borderColor: "border-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/40",
    defaultTitle: "Attenzione",
  },
  nota: {
    icon: Pin,
    iconColor: "text-green-500",
    borderColor: "border-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/40",
    defaultTitle: "Nota",
  },
  esempio: {
    icon: Search,
    iconColor: "text-orange-500",
    borderColor: "border-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/40",
    defaultTitle: "Esempio",
  },
};

// ─── INTERFACCIA DEL COMPONENTE ───────────────────────────────────────────────
type CalloutProps = {
  type?: keyof typeof CALLOUT_TYPES;
  title?: string;
  children: React.ReactNode;
};

// ─── COMPONENTE: Callout ──────────────────────────────────────────────────────
// UTILIZZO NEI FILE .mdx:
//   <Callout type="teorema" title="Teorema di Pitagora">
//     In ogni triangolo rettangolo...
//   </Callout>
export function Callout({ type = "nota", title, children }: CalloutProps) {
  const config = CALLOUT_TYPES[type] ?? CALLOUT_TYPES.nota;
  const displayTitle = title ?? config.defaultTitle;

  // `Icon` è il componente Lucide estratto dalla mappa. Lo usiamo come un tag JSX normale.
  const Icon = config.icon;

  return (
    <div
      className={`not-prose border-l-4 ${config.borderColor} ${config.bgColor} rounded-r-lg p-4 my-6`}
    >
      {/* Riga del titolo: icona Lucide + testo uppercase */}
      <div className="flex items-center gap-2 mb-2">
        {/* 
          Rendiamo l'icona con size={15} per allinearla al testo small.
          Il colore viene dalla mappa: ogni tipo ha il suo colore specifico.
        */}
        <Icon size={15} className={config.iconColor} />
        <span className="font-semibold text-sm uppercase tracking-wide text-gray-900 dark:text-gray-100">
          {displayTitle}
        </span>
      </div>

      {/* Contenuto del callout, con prose abilitato per formattare il Markdown interno */}
      <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed prose dark:prose-invert max-w-none">
        {children}
      </div>
    </div>
  );
}
