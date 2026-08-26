import nextMDX from '@next/mdx'
import type { NextConfig } from 'next'

// Questo file configura Next.js e il motore che legge i tuoi file MDX.
// Il processo avviene in due passaggi: "remark" (lavora sul testo Markdown)
// e "rehype" (lavora sul codice HTML generato).

const withMDX = nextMDX({
  options: {
    // PLUGIN REMARK (Operano sul testo Markdown crudo)
    // - remark-gfm: Supporta le estensioni di GitHub (tabelle, sbarrato, liste di cose da fare).
    // - remark-math: Riconosce i simboli del dollaro ($ e $$) come equazioni.
    // - remark-(mdx)-frontmatter: Riconoscono e mettono in disparte lo YAML all'inizio del file.
    remarkPlugins: ['remark-gfm', 'remark-math', 'remark-frontmatter', 'remark-mdx-frontmatter'],
    
    // PLUGIN REHYPE (Operano sul risultato HTML)
    // - rehype-katex: Trasforma le equazioni riconosciute prima in HTML stilizzato per la matematica.
    // - rehype-pretty-code: Prende i blocchi di codice (es. ```cpp) e li colora con il tema scelto.
    rehypePlugins: ['rehype-katex', ['rehype-pretty-code', { theme: 'gruvbox-dark-medium' }]],
  },
})

// Qui diciamo a Next.js di considerare i file .mdx e .md come normali "Pagine"
// del sito web (esattamente come i .tsx e .jsx)
const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
}

// Esporta la configurazione "fusa" tra le opzioni standard di Next e quelle di MDX
export default withMDX(nextConfig)