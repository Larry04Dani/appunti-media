import fs from "fs";
import path from "path";

// Definiamo la struttura (il "Tipo") di ogni elemento della nostra Sidebar.
// Ogni elemento può essere una semplice cartella (che contiene figli) o una pagina cliccabile (se ha un url).
export type TreeNode = {
  name: string;        // Nome da mostrare (es. "Analisi 1")
  url?: string;        // Il link alla pagina (se esiste un file page.mdx al suo interno)
  children?: TreeNode[]; // Sottocartelle o pagine figlie
};

/**
 * Questa funzione legge il disco del server per esplorare le cartelle dentro "app/Appunti".
 * @param dirPath Il percorso assoluto della cartella da esplorare (es. "/Users/.../app/Appunti")
 * @param basePath L'URL di base corrispondente (es. "/Appunti")
 */
export function buildTree(dirPath: string, basePath: string): TreeNode[] {
  // Se la cartella non esiste (es. l'utente non ha ancora creato "/Appunti"), restituiamo un array vuoto
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  // Leggiamo tutto il contenuto della cartella (file e sottocartelle)
  const items = fs.readdirSync(dirPath);
  const nodes: TreeNode[] = [];

  for (const item of items) {
    // Ignoriamo i file di sistema nascosti (come .DS_Store del Mac) e file speciali che non sono appunti
    if (item.startsWith(".") || item === "layout.tsx" || item === "globals.css") {
      continue;
    }

    const fullPath = path.join(dirPath, item);
    const isDirectory = fs.statSync(fullPath).isDirectory();

    // In Next.js App Router, le pagine vere e proprie sono definite dalla presenza
    // di un file chiamato "page.mdx" o "page.tsx" dentro una cartella.
    if (isDirectory) {
      // Calcoliamo l'URL di questa cartella
      const urlPath = `${basePath}/${item}`;
      
      // Controlliamo se dentro questa cartella c'è un file page.mdx o page.tsx
      const hasPageFile = 
        fs.existsSync(path.join(fullPath, "page.mdx")) || 
        fs.existsSync(path.join(fullPath, "page.tsx"));

      // Esploriamo ricorsivamente se ci sono sottocartelle!
      // (È qui la vera magia: la funzione chiama sé stessa per scendere nell'albero all'infinito)
      const children = buildTree(fullPath, urlPath);

      // Aggiungiamo questo nodo alla nostra lista
      nodes.push({
        // Possiamo pulire il nome rimuovendo trattini bassi o estensioni se volessimo
        name: item.replace(/-/g, " "),
        // Se c'è una pagina, assegniamo l'URL, altrimenti lo lasciamo undefined (sarà solo un menu a tendina)
        url: hasPageFile ? urlPath : undefined,
        // Se ci sono figli, li assegniamo. Altrimenti lasciamo undefined.
        children: children.length > 0 ? children : undefined,
      });
    }
  }

  return nodes;
}
