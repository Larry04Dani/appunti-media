"use client"; // Serve per usare hook come usePathname per capire su che pagina siamo

import Link from "next/link";
import { usePathname } from "next/navigation";

// Simuliamo una lista di materie e appunti. 
// In futuro, potresti caricare questi dati dinamicamente leggendo le cartelle!
const MENU_ITEMS = [
  {
    anno: "1 Anno",
    
    links: [
      { href: "/matematica/analisi-1", label: "Analisi 1" },
      { href: "/matematica/algebra-lineare", label: "Algebra Lineare" },
    ],
  },
  {
    title: "Informatica",
    links: [
      { href: "/informatica/programmazione", label: "Programmazione C++" },
      { href: "/informatica/algoritmi", label: "Algoritmi" },
    ],
  },
  {
    title: "Grafica",
    links: [
      { href: "/grafica/fondamenti", label: "Fondamenti 3D" },
    ],
  },
];

export function Sidebar() {
  // Ottiene l'URL attuale (es. "/matematica/analisi-1") per evidenziare il link attivo
  const pathname = usePathname();

  return (
    // 'w-64' fissa la larghezza. 'shrink-0' impedisce alla barra di restringersi
    // 'hidden md:block' nasconde la sidebar sui telefoni e la mostra sui tablet/pc
    <aside className="w-64 shrink-0 hidden md:block border-r border-gray-200 dark:border-gray-800 pr-6 min-h-[calc(100vh-100px)]">
      <nav className="sticky top-8 flex flex-col gap-8">
        {/* Cicliamo attraverso le sezioni principali (Matematica, Informatica...) */}
        {MENU_ITEMS.map((section) => (
          <div key={section.title}>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">
              {section.title}
            </h3>
            <ul className="flex flex-col gap-2">
              {/* Cicliamo attraverso le singole pagine della sezione */}
              {section.links.map((link) => {
                // Verifichiamo se il link corrente corrisponde alla pagina visualizzata
                const isActive = pathname === link.href;

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block text-sm transition-colors ${
                        isActive
                          ? "text-primary font-semibold" // Stile se la pagina è attiva
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" // Stile normale
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
