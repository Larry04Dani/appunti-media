import type { MDXComponents } from 'mdx/types'

// Questo file è vitale per usare @next/mdx. 
// Ti permette di mappare i normali tag HTML (generati dal tuo Markdown)
// su componenti React personalizzati.
// Risorsa: https://nextjs.org/docs/app/building-your-application/configuring/mdx

// Importiamo i nostri tre nuovi componenti personalizzati
import { Callout } from '@/components/callout'
import { Spoiler } from '@/components/spoiler'
import { CodeCopy } from '@/components/code-copy'
import { Riferimento } from '@/components/riferimento'
import { P5Sketch } from '@/components/p5-sketch'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // I componenti base passati da Next.js
    ...components,

    // ─── TABELLE RESPONSIVE ──────────────────────────────────────────────────
    // Intercettiamo ogni <table> del Markdown e la avvolgiamo in un div scrollabile.
    // Se la tabella è troppo larga per lo schermo, l'utente potrà scorrerla 
    // in orizzontale senza rompere il layout della pagina.
    table: ({ children }) => (
      <div className="overflow-x-auto w-full border border-gray-200 dark:border-gray-800 rounded-lg my-6">
        <table className="w-full text-sm text-left my-0 divide-y divide-gray-200 dark:divide-gray-800">
          {children}
        </table>
      </div>
    ),

    // ─── BLOCCHI DI CODICE CON PULSANTE COPIA ───────────────────────────────
    // Intercettiamo ogni tag <pre> generato automaticamente da rehype-pretty-code
    // (il plugin che colora la sintassi dei blocchi ```linguaggio```).
    // Lo sostituiamo con il nostro componente CodeCopy, che aggiunge il pulsante
    // "Copia" in alto a destra visibile al hover.
    // NOTA: Non usiamo <CodeCopy> direttamente nei file .mdx, viene attivato in automatico!
    pre: ({ children, ...props }) => (
      <CodeCopy {...props}>{children}</CodeCopy>
    ),

    // ─── COMPONENTI DA USARE DIRETTAMENTE NEI FILE .MDX ─────────────────────
    // Questi vengono esportati come tag JSX direttamente utilizzabili nei tuoi appunti.
    // Non devi importarli manualmente in ogni file .mdx: funzionano "magicamente" 
    // perché sono registrati qui a livello globale.

    // CALLOUT — per definizioni, teoremi, note, avvisi, ecc.
    // Uso: <Callout type="teorema" title="Teorema di Pitagora">...</Callout>
    // Tipi disponibili: definizione | teorema | dimostrazione | attenzione | nota | esempio
    Callout,

    // SPOILER — per nascondere risposte durante il ripasso
    // Uso: <Spoiler title="Mostra risposta">Il contenuto nascosto...</Spoiler>
    Spoiler,

    // RIFERIMENTO — link a pagine interne o esterne con titolo in evidenza
    // Uso interno:  <Riferimento href="/Appunti/1Anno/Analisi" title="Analisi 1" />
    // Uso esterno:  <Riferimento href="https://wikipedia.org/..." title="Wikipedia" />
    Riferimento,

    // P5SKETCH — box animato/interattivo con p5.js
    // Gli sketch sono definiti in lib/sketches.ts e referenziati per nome.
    // Uso: <P5Sketch id="particles" width={600} height={280} />
    //      <P5Sketch id="lissajous" />
    P5Sketch,
  }
}