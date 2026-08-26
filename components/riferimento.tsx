"use client";

import React from "react";
import Link from "next/link";
// ExternalLink per link a siti esterni, Link2 per link interni al sito
import { Link2 } from "lucide-react";

// ─── INTERFACCIA DEL COMPONENTE ───────────────────────────────────────────────
type RiferimentoProps = {
  // `href` è il percorso della pagina a cui linkare.
  // Può essere:
  //   - Percorso interno (es. "/Appunti/1Anno/Analisi")
  //   - URL esterno (es. "https://wikipedia.org/...")
  href: string;
  // Titolo del riferimento (cosa compare in grassetto come intestazione)
  title: string;
  // Testo descrittivo opzionale sotto al titolo
  children?: React.ReactNode;
};

// ─── COMPONENTE: Riferimento ──────────────────────────────────────────────────
// Un callout speciale per citare fonti, pagine correlate o argomenti collegati.
// Il titolo è cliccabile e porta al link indicato.
//
// UTILIZZO NEI FILE .mdx:
//   <Riferimento href="/Appunti/1Anno/Analisi/page" title="Analisi 1 — Limiti">
//     Vedi la sezione sui limiti per la definizione formale di continuità.
//   </Riferimento>
//
//   <Riferimento href="https://it.wikipedia.org/wiki/Teorema_di_Pitagora" title="Wikipedia — Teorema di Pitagora" />
export function Riferimento({ href, title, children }: RiferimentoProps) {
  // Determiniamo se il link è esterno (inizia con http) o interno al sito.
  // I link interni usano il componente <Link> di Next.js (navigazione senza ricarica pagina).
  // I link esterni usano un normale <a> con target="_blank" (apre nuova scheda).
  const isExternal = href.startsWith("http");

  // Il contenuto cliccabile del titolo (uguale per entrambi i casi)
  const titleContent = (
    <div className="flex items-center gap-2 group">
      {/* Icona che si colora al hover */}
      <Link2
        size={15}
        className="text-primary shrink-0 transition-transform group-hover:scale-110"
      />
      {/* 
        Il titolo in grassetto con colore `text-primary`.
        `underline-offset-2` migliora l'estetica della sottolineatura al hover.
      */}
      <span className="font-bold text-primary underline-offset-2 group-hover:underline">
        {title}
      </span>
    </div>
  );

  return (
    // Stile simile ai Callout, ma con bordatura primaria e sfondo primario tenue
    <div className="not-prose border-l-4 border-primary bg-primary/5 dark:bg-primary/10 rounded-r-lg p-4 my-6">
      
      {/* Rendiamo il titolo come link, scegliendo il componente giusto */}
      {isExternal ? (
        // Link esterno: apre in una nuova scheda
        <a href={href} target="_blank" rel="noopener noreferrer">
          {titleContent}
        </a>
      ) : (
        // Link interno: usa il router di Next.js per navigare senza ricaricare la pagina
        <Link href={href}>
          {titleContent}
        </Link>
      )}

      {/* Testo descrittivo opzionale sotto al titolo */}
      {children && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed prose dark:prose-invert max-w-none">
          {children}
        </div>
      )}
    </div>
  );
}
