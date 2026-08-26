"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

// ─── INTERFACCIA DEL COMPONENTE ───────────────────────────────────────────────
type SpoilerProps = {
  title?: string;         // Il testo del pulsante (default: "Mostra risposta")
  children: React.ReactNode; // Il contenuto nascosto
};

// ─── COMPONENTE: Spoiler ──────────────────────────────────────────────────────
// Utile per il ripasso (Active Recall): scrivi una domanda, metti la risposta
// dentro <Spoiler> e testati prima di cliccare.
//
// UTILIZZO NEI FILE .mdx:
//   **Domanda:** Qual è la complessità del QuickSort nel caso peggiore?
//
//   <Spoiler title="Mostra risposta">
//     È **O(n²)**, ma nel caso medio è O(n log n).
//   </Spoiler>
export function Spoiler({ title = "Mostra risposta", children }: SpoilerProps) {
  // `isOpen` tiene traccia di se il contenuto è visibile o meno.
  // Parte da `false` (nascosto).
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="not-prose my-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Pulsante per aprire/chiudere lo spoiler */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        // `w-full` lo fa occupare tutta la larghezza come una barra
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
        aria-expanded={isOpen} // Buona pratica per l'accessibilità (screen reader)
      >
        <span>{isOpen ? "Nascondi" : title}</span>

        {/* La freccina ruota di 180° quando lo spoiler è aperto grazie a `rotate-180` */}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* 
        Contenuto nascosto.
        `grid grid-rows-[0fr]` e `grid-rows-[1fr]` è un trucco moderno di CSS/Tailwind
        per animare l'altezza da 0 ad "automatica" in modo fluido (molto difficile con height direttamente).
        La transizione tra i due stati crea l'effetto "tendina".
      */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        {/* Il `min-h-0` è necessario: senza di esso, il trucco della griglia non funziona! */}
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none border-t border-gray-200 dark:border-gray-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
