"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useValidRoutes } from "@/components/notes-tree-provider";

// ─── COME FUNZIONANO I BREADCRUMBS ───────────────────────────────────────────
// Dato un URL come "/Appunti/1-Anno/1-Semestre/Analisi-1/Teoria/1-Introduzione-ai-limiti":
// 1. Splitta il percorso per "/" → ["Appunti", "1-Anno", "1-Semestre", "Analisi-1", "Teoria", "1-Introduzione-ai-limiti"]
// 2. Per ogni segmento, costruisce l'href cumulativo.
// 3. VERIFICA se per ciascun segmento esiste effettivamente una pagina associata (page.mdx/tsx).
//    - Se esiste → renderizza un <Link> cliccabile
//    - Se NON esiste (es. "/Appunti" o "Teoria/") → renderizza un <span> di solo testo,
//      evitando all'utente di cliccare su cartelle organizzative e ricevere un errore 404!
// 4. L'ultimo segmento (pagina attuale) viene mostrato in grassetto e non linkabile.

function formatLabel(segment: string): string {
  return segment
    // Sostituisce i trattini con spazi (es. "analisi-1" → "analisi 1")
    .replace(/-/g, " ")
    // Mette in maiuscolo solo la prima lettera
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function Breadcrumbs() {
  // Otteniamo il percorso corrente dall'URL
  const pathname = usePathname();
  // Otteniamo l'elenco di tutte le pagine effettive del sito dal provider
  const validRoutes = useValidRoutes();

  // Se siamo nella homepage ("/"), non mostriamo nulla
  if (pathname === "/") return null;

  // Splittiamo il percorso in segmenti
  const segments = pathname.split("/").filter(Boolean);

  // Costruiamo l'array di "crumbs" (briciole) con label e href cumulativo
  const crumbs = segments.reduce<{ label: string; href: string }[]>(
    (acc, segment) => {
      const href = (acc[acc.length - 1]?.href ?? "") + "/" + segment;
      return [...acc, { label: formatLabel(segment), href }];
    },
    []
  );

  return (
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

      {/* Mappa ogni briciola */}
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        // Controlliamo se per questo href cumulativo esiste una pagina reale sul disco
        const hasPage = validRoutes.some(
          (route) => route.toLowerCase() === crumb.href.toLowerCase()
        );

        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {/* Separatore */}
            <ChevronRight
              size={13}
              className="text-gray-400 dark:text-gray-600 shrink-0"
            />

            {isLast ? (
              // Pagina corrente: testo in evidenza non linkabile
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {crumb.label}
              </span>
            ) : hasPage ? (
              // Cartella intermedia con pagina associata: link cliccabile
              <Link
                href={crumb.href}
                className="hover:text-primary transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              // Cartella intermedia senza pagina (es. "Appunti", "Teoria"): solo testo non cliccabile (nessun 404!)
              <span
                className="text-gray-400 dark:text-gray-500 cursor-default select-none"
                title="Cartella organizzativa (nessuna pagina associata)"
              >
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
