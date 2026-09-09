"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

// ─── COME FUNZIONANO I BREADCRUMBS ───────────────────────────────────────────
// Dato un URL come "/Appunti/1Anno/Analisi", il componente:
// 1. Splitta il percorso per "/" → ["Appunti", "1Anno", "Analisi"]
// 2. Per ogni segmento, costruisce il percorso cumulativo:
//    - "Appunti"         → href: "/Appunti"
//    - "1Anno"           → href: "/Appunti/1Anno"
//    - "Analisi"         → href: "/Appunti/1Anno/Analisi"   ← pagina attuale (non linkabile)
// 3. Stampa i segmenti separati da una freccia ›

// Questa funzione prende un segmento dell'URL (es. "1Anno" o "analisi-matematica")
// e lo trasforma in un'etichetta leggibile (es. "1Anno" → "1Anno", "analisi-matematica" → "Analisi matematica")
function formatLabel(segment: string): string {
  return (
    segment
      // Sostituisce i trattini con spazi (es. "analisi-1" → "analisi 1")
      .replace(/-/g, " ")
      // Mette in maiuscolo solo la prima lettera
      .replace(/^\w/, (c) => c.toUpperCase())
  );
}

export function Breadcrumbs() {
  // Otteniamo il percorso corrente dall'URL (es. "/Appunti/1Anno/Analisi")
  const pathname = usePathname();

  // Se siamo nella homepage ("/"), non mostriamo nulla: la breadcrumb sarebbe solo "Home" inutilmente
  if (pathname === "/") return null;

  // Splittiamo il percorso in segmenti, filtrando le stringhe vuote che `split` produce
  // Es. "/Appunti/1Anno/Analisi".split("/") → ["", "Appunti", "1Anno", "Analisi"]
  // Con filter(Boolean) rimuoviamo la stringa vuota iniziale → ["Appunti", "1Anno", "Analisi"]
  const segments = pathname.split("/").filter(Boolean);

  // Costruiamo l'array di "crumbs" (briciole), ognuno con label e href
  // `reduce` è come un ciclo che accumula un risultato.
  // Partiamo con un array vuoto e, per ogni segmento, aggiungiamo un oggetto { label, href }
  // dove `href` è la concatenazione di tutti i segmenti precedenti + quello corrente.
  const crumbs = segments.reduce<{ label: string; href: string }[]>(
    (acc, segment) => {
      // L'href di questo segmento è l'href del precedente + "/" + questo segmento
      const href = (acc[acc.length - 1]?.href ?? "") + "/" + segment;
      return [...acc, { label: formatLabel(segment), href }];
    },
    []
  );

  return (
    // `not-prose` esclude la barra dai formati del plugin Tailwind Typography
    <nav
      aria-label="Breadcrumb"
      className="not-prose flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-6 flex-wrap"
    >
      {/* Icona Home che porta sempre alla homepage */}
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-primary transition-colors"
        title="Home"
      >
        <Home size={13} />
        <span>Home</span>
      </Link>

      {/* Mappa ogni "briciola" come un link separato da una freccia */}
      {crumbs.map((crumb, index) => {
        // L'ultimo segmento è la pagina corrente: lo stampiamo come testo, NON come link
        const isLast = index === crumbs.length - 1;

        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {/* Separatore */}
            <ChevronRight size={13} className="text-gray-400 dark:text-gray-600 shrink-0" />

            {isLast ? (
              // Pagina corrente: grassetto e colore primario, non è un link
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {crumb.label}
              </span>
            ) : (
              // Pagina intermedia: è un link cliccabile
              <Link
                href={crumb.href}
                className="hover:text-primary transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
