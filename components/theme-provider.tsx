// Anche qui serve "use client" perché next-themes deve interagire col browser
// per leggere e scrivere nel localStorage il tema preferito dall'utente.
"use client";

import * as React from "react";
// Importiamo il provider ufficiale fornito dal pacchetto 'next-themes'
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Creiamo un nostro componente Wrapper che passa semplicemente i children (il resto del sito)
// al provider di next-themes. 
// Risorsa: https://github.com/pacocoursey/next-themes
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
