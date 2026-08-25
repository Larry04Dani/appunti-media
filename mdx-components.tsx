import type { MDXComponents } from 'mdx/types'

// Questo file è vitale per usare @next/mdx. 
// Ti permette di mappare i normali tag HTML (generati dal tuo Markdown)
// su componenti React personalizzati.
// Risorsa: https://nextjs.org/docs/app/building-your-application/configuring/mdx#add-an-mdx-componentstsx-file

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // I componenti base passati da Next.js
    ...components,

    // ESEMPIO DI PERSONALIZZAZIONE (attualmente commentato):
    // Se togliessi i commenti, ogni titolo # (h1) nei tuoi appunti diventerebbe verde e grassetto.
    // h1: ({ children }) => (
    //   <h1 className="text-5xl font-black text-green-500 mb-6">{children}</h1>
    // ),
    
    // ESEMPIO CITAZIONE (Blockquote):
    // Trasforma i > del markdown in dei bei box di avviso grigi.
    // blockquote: ({ children }) => (
    //   <blockquote className="border-l-4 border-gray-400 bg-gray-100 p-4 rounded italic">
    //     {children}
    //   </blockquote>
    // ),

    // GESTIONE TABELLE RESPONSIVE:
    // Questa funzione intercetta ogni tabella `<table>` creata in Markdown/Obsidian.
    // La avvolge in un `<div>` con la classe `overflow-x-auto`.
    // In questo modo, se la tabella ha troppe colonne, l'utente potrà scorrerla lateralmente su mobile
    // anziché rompere l'impaginazione del sito o tagliarla.
    table: ({ children }) => (
      <div className="overflow-x-auto w-full border border-gray-200 dark:border-gray-800 rounded-lg my-6">
        {/* Usiamo table-auto per far sì che la tabella si auto-adatti al contenuto */}
        <table className="w-full text-sm text-left my-0 divide-y divide-gray-200 dark:divide-gray-800">
          {children}
        </table>
      </div>
    ),
  }
}