"use client";

import React, { useState, useRef } from "react";
import { Copy, Check } from "lucide-react";

// ─── COME FUNZIONA IL CodeCopy ────────────────────────────────────────────────
// `rehype-pretty-code` trasforma i tuoi blocchi ```cpp``` in tag <pre><code>...</code></pre>
// con la colorazione e gli attributi data-* già applicati.
//
// Il problema della versione precedente: avvolgevamo il <pre> in un <div>,
// scollegandolo dal suo contesto CSS e rompendo gli stili di Shiki.
//
// La soluzione corretta: aggiungere `relative group` DIRETTAMENTE al <pre> originale,
// così tutti gli stili di rehype-pretty-code restano intatti e il pulsante si posiziona
// in modo assoluto rispetto al blocco di codice come se fossero un tutt'uno.

type CodeCopyProps = {
  children: React.ReactNode;
  // `className` è la classe CSS che rehype-pretty-code ha già assegnato al <pre>.
  // La estraiamo separatamente per poterla unire alle nostre classi extra.
  className?: string;
  // Tutti gli altri attributi del <pre> (es. data-language="cpp", data-theme, ecc.)
  [key: string]: unknown;
};

export function CodeCopy({ children, className, ...props }: CodeCopyProps) {
  const [copied, setCopied] = useState(false);

  // ref al <pre> per leggere il testo puro del codice tramite .textContent
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = () => {
    // .textContent restituisce solo il testo visibile, ignorando i tag <span>
    // di colorazione aggiunti da Shiki. L'operatore `?.` evita errori se il ref 
    // non è ancora collegato al DOM (situazione rara ma possibile).
    const code = preRef.current?.textContent ?? "";
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    // Usiamo DIRETTAMENTE il tag <pre>, NON un div wrapper.
    // - `relative` è necessario per ancorare il pulsante "Copia" in posizione assoluta.
    // - `group` permette al figlio (il pulsante) di reagire all'hover del genitore.
    // - `className` conserva intatte TUTTE le classi di rehype-pretty-code (colori, font, padding...).
    <pre
      ref={preRef}
      // Uniamo la classe originale di Shiki con le nostre due classi extra
      className={`relative group ${className ?? ""}`}
      // Riapplichiamo tutti gli altri attributi (data-language, data-theme, ecc.)
      {...props}
    >
      {/* 
        Il pulsante di copia.
        - `absolute top-3 right-3` lo posiziona nell'angolo in alto a destra del <pre>.
        - `opacity-0 group-hover:opacity-100` lo rende invisibile fino all'hover sul blocco.
        - `transition-all duration-200` rende l'apparizione/sparizione fluida.
      */}
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5
          text-xs font-medium rounded-md
          bg-gray-700/80 text-gray-300
          hover:bg-gray-600 hover:text-white
          opacity-0 group-hover:opacity-100
          transition-all duration-200"
        aria-label="Copia codice"
      >
        {copied ? (
          <>
            <Check size={12} className="text-green-400" />
            <span className="text-green-400">Copiato!</span>
          </>
        ) : (
          <>
            <Copy size={12} />
            <span>Copia</span>
          </>
        )}
      </button>

      {/* Il contenuto <code> già processato da rehype-pretty-code, intoccato */}
      {children}
    </pre>
  );
}
