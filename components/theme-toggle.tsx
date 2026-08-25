// "use client" dice a Next.js che questo componente deve essere eseguito dal browser
// e non dal server. Serve ogni volta che hai bottoni interattivi (onClick) o
// usi "stati" come useState (le variabili che cambiano dinamicamente su schermo).
"use client";

import * as React from "react";
// Icone SVG importate dalla comodissima libreria lucide-react
import { Moon, Sun } from "lucide-react";
// L'hook principale di next-themes per leggere il tema attuale e per cambiarlo
import { useTheme } from "next-themes";

export function ThemeToggle() {
  // theme contiene la stringa ("light" o "dark")
  // setTheme è la funzione che usi per cambiarlo
  const { theme, setTheme } = useTheme();
  
  // mounted ci dice se il componente è già stato caricato ("montato") sulla pagina
  const [mounted, setMounted] = React.useState(false);

  // useEffect esegue questa funzione solo la prima volta che la pagina si carica.
  // Serve ad evitare un errore tecnico detto "Hydration Mismatch" (ovvero il server che 
  // aveva disegnato un sole e il tuo browser che, preferendo il tema dark, disegna una luna).
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Se la pagina non è ancora "pronta", restituisce un riquadro vuoto grande quanto l'icona
  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    // Il bottone reagisce al click cambiando il tema tra "dark" e "light"
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {/* Se il tema è dark mostra il sole (per poter tornare alla luce), altrimenti mostra la luna */}
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-gray-700" />
      )}
    </button>
  );
}
