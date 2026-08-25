import type { Metadata } from "next";
// Importa i font di Google ottimizzati da Next.js. 
// Risorsa: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
import { Geist, Geist_Mono } from "next/font/google";

// Importa il file CSS globale dove abbiamo definito i colori base e Tailwind
import "./globals.css";

// Importa i nostri componenti per il tema (Chiaro/Scuro)
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

// Importa la barra di navigazione (Navbar) che abbiamo creato
import { Navbar } from "@/components/navbar";

// Configurazione dei font. Next.js li scaricherà al momento della build
// per non rallentare il caricamento della pagina per l'utente finale.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Questi sono i metadati SEO (Titolo della scheda del browser, descrizione, ecc.)
// Risorsa: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
export const metadata: Metadata = {
  title: "Appunti Scienze e Tecnologie per i Media", 
  description: "Raccolta di appunti universitari di Scienze e Tecnologie per i Media, con formule matematiche, codice e immagini.",
};

// Il RootLayout è lo "scheletro" di TUTTE le pagine del sito.
// Qualsiasi cosa metti qui dentro (es. una navbar) apparirà in ogni singola pagina.
// `children` rappresenta il contenuto specifico della pagina in cui ti trovi (es. page.mdx).
// Importiamo la funzione che abbiamo creato per esplorare le cartelle
import { buildTree } from "@/lib/get-notes-tree";
import path from "path";
import { Sidebar } from "@/components/sidebar";

// Ora la funzione è "async" (asincrona) perché deve leggere il disco (filesystem)
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // Calcoliamo il percorso assoluto della cartella "/app/Appunti" sul disco
  const appuntiPath = path.join(process.cwd(), "app/Appunti");
  
  // Leggiamo tutto l'albero di cartelle e file. L'URL di base sarà "/Appunti"
  const tree = buildTree(appuntiPath, "/Appunti");

  return (
    // suppressHydrationWarning è necessario per next-themes, evita errori quando il server
    // genera la pagina ma non sa ancora se l'utente preferisce il tema chiaro o scuro.
    <html lang="it" suppressHydrationWarning>
      <head>
        {/* Questo link serve a caricare il CSS per la matematica (formule) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
        />
      </head>
      
      {/* 
        Il body fa da contenitore a pieno schermo per l'intero sito.
        ATTENZIONE: Le classi 'prose' sono state spostate più in basso, nel tag <main>.
        Se le lasciassimo nel <body>, influenzerebbero lo stile della Sidebar rovinandola!
      */}
      <body className="bg-background text-foreground antialiased min-h-screen flex flex-col overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Contenitore principale centrato, largo al massimo 1280px (max-w-7xl) */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            
            <Navbar />
            
            {/* Flex container per affiancare Sidebar (a sinistra) e Contenuto (a destra) */}
            <div className="flex gap-4 lg:gap-8 pb-16 relative">
              
              {/* Passiamo l'albero letto dal server al componente Sidebar (che è Client) */}
              <Sidebar tree={tree} />
              
              {/* Il tag <main> accoglie il file .mdx. 
                  'flex-1' gli fa occupare tutto lo spazio rimanente accanto alla sidebar.
                  'min-w-0' evita bug di overflow quando inserisci frammenti di codice molto lunghi. */}
              <main className="flex-1 min-w-0 prose dark:prose-invert max-w-none
                prose-headings:text-primary dark:prose-headings:text-primary
                prose-h1:text-4xl prose-h1:font-extrabold 
                prose-h2:text-3xl prose-h2:text-secondary prose-h2:font-bold dark:prose-h2:text-secondary
                prose-a:text-blue-500 hover:prose-a:text-blue-400
                prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:rounded prose-code:px-1
              ">
                {children}
              </main>

            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
