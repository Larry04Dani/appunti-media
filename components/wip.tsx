import React from "react";

// ─── INTERFACCIA DEL COMPONENTE ───────────────────────────────────────────────
type WipProps = {
  // Testo o etichetta opzionale da mostrare al centro della barra (es. "LAVORI IN CORSO")
  text?: string;
  // Contenuto alternativo per il badge centrale
  children?: React.ReactNode;
  // Classi Tailwind aggiuntive per personalizzare margini, altezza, ecc.
  className?: string;
};

// ─── COMPONENTE: Wip (Work In Progress) ─────────────────────────────────────────
// Rappresenta una barra orizzontale con il classico pattern a strisce diagonali
// giallo e nero (nastro da cantiere / pericolo / lavori in corso).
//
// UTILIZZO NEI FILE .mdx:
//   <Wip />
//
//   <Wip text="Lavori in corso" />
//
//   <Wip className="h-8 my-8" />
export function Wip({ text, children, className = "" }: WipProps) {
  const content = text || children;

  // Stile CSS con gradiente lineare ripetuto a 45 gradi per creare il pattern a strisce
  const tapeBackground = {
    backgroundImage: `repeating-linear-gradient(
      -45deg,
      #facc15 0px,
      #facc15 14px,
      #18181b 14px,
      #18181b 28px
    )`,
  };

  return (
    <div
      role="status"
      aria-label={typeof content === "string" ? content : "Work in progress"}
      className={`not-prose w-full my-6 flex items-center justify-center relative overflow-hidden ${
        content ? "h-8 sm:h-9" : "h-5 sm:h-6"
      } ${className}`}
      style={tapeBackground}
    >
      {/* Etichetta opzionale al centro della barra */}
      {content && (
        <div className="relative z-10 px-3 py-0.5 bg-black text-yellow-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 select-none">
          <span>⚠️</span>
          <span>{content}</span>
        </div>
      )}
    </div>
  );
}
