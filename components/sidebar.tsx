"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// Importiamo icone comode per mostrare cartelle, file e bottoni di espansione
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from "lucide-react";
// Importiamo il Tipo della nostra struttura dati
import { TreeNode } from "@/lib/get-notes-tree";

/* -------------------------------------------------------------------------
   SOTTO-COMPONENTE: SidebarNode
   Gestisce il rendering di un singolo elemento (cartella o file) nell'albero.
   È "ricorsivo": se ha dei figli, chiama sé stesso per stamparli!
   ------------------------------------------------------------------------- */
function SidebarNode({ node, level = 0 }: { node: TreeNode; level?: number }) {
  const pathname = usePathname();
  // Stato locale per ricordare se QUESTA specifica cartella è aperta o chiusa
  const [isExpanded, setIsExpanded] = useState(false);

  // Un nodo ha dei figli se la proprietà children esiste ed ha elementi
  const hasChildren = node.children && node.children.length > 0;
  // È la pagina in cui ci troviamo attualmente?
  const isActive = node.url && pathname === node.url;

  return (
    <div className="flex flex-col">
      {/* 
        Riga principale dell'elemento.
        Indentiamo dinamicamente in base a quanto siamo scesi nell'albero (level)
      */}
      <div 
        className={`flex items-center gap-1.5 py-1 px-1.5 rounded-md transition-colors ${
          isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground/70 hover:bg-primary/10 hover:text-primary"
        }`}
        style={{ paddingLeft: `${level * 10 + 6}px` }}
      >
        {/* Pulsante freccina per espandere/collassare (solo se ci sono figli) */}
        {hasChildren ? (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 rounded hover:bg-primary/20 shrink-0"
            aria-label="Espandi cartella"
          >
            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
        ) : (
          // Spazio vuoto per allineare i file che non hanno la freccina
          <div className="w-[16px] shrink-0" />
        )}

        {/* Icona della cartella (se ha figli) o del file (se è una foglia) */}
        {hasChildren ? (
          isExpanded ? <FolderOpen size={14} className="text-primary shrink-0" /> : <Folder size={14} className="text-primary shrink-0" />
        ) : (
          <FileText size={14} className="text-primary/60 shrink-0" />
        )}

        {/* Nome del nodo. Se ha un URL è un link, altrimenti è solo testo cliccabile per espandere */}
        {node.url ? (
          <Link href={node.url} className="flex-1 truncate text-xs leading-tight">
            {node.name}
          </Link>
        ) : (
          <span 
            className="flex-1 truncate text-xs leading-tight cursor-pointer" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {node.name}
          </span>
        )}
      </div>

      {/* 
        Se il nodo ha figli ed è espanso, stampiamo i figli!
        Ecco la "ricorsione": chiamiamo SidebarNode dentro SidebarNode, 
        aumentando il livello (che aumenterà l'indentazione).
      */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col">
          {node.children!.map((child, idx) => (
            <SidebarNode key={idx} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
   COMPONENTE PRINCIPALE: Sidebar
   Accetta l'intero albero di navigazione come "Prop" dal server.
   ------------------------------------------------------------------------- */
export function Sidebar({ tree }: { tree: TreeNode[] }) {
  // Stato globale della Sidebar intera (mostrata / nascosta)
  // Partiamo con "true" di default (Sidebar visibile)
  const [isOpen, setIsOpen] = useState(true);

  // Larghezza sidebar in px — usata sia per il pannello che per lo spacer
  const SIDEBAR_W = 220;

  return (
    <>
      {/* 
        Sidebar fissa sul bordo sinistro, che parte SOTTO la navbar.
        `top: var(--navbar-h)` e `height: calc(100vh - var(--navbar-h))`
        la mantengono ancorata esattamente all'area di contenuto.
      */}
      <aside
        className={`fixed left-0 z-40 bg-background border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: `${SIDEBAR_W}px`,
          top: "var(--navbar-h)",
          height: "calc(100vh - var(--navbar-h))",
        }}
      >
        {/* Albero di navigazione scrollabile */}
        <nav className="flex-1 overflow-y-auto pt-3 pb-2 px-1.5">
          {tree.length === 0 ? (
            <p className="text-xs text-gray-500 italic px-2">Nessun appunto trovato.</p>
          ) : (
            tree.map((node, idx) => (
              <SidebarNode key={idx} node={node} />
            ))
          )}
        </nav>
      </aside>

      {/* 
        Tab di toggle — ancorato al bordo destro della sidebar, centrato
        verticalmente nell'area sotto la navbar (non nell'intera viewport).
      */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          left: isOpen ? `${SIDEBAR_W}px` : "0px",
          top: "calc(var(--navbar-h) + (100vh - var(--navbar-h)) / 2)",
        }}
        className="fixed -translate-y-1/2 z-50 flex items-center justify-center w-5 h-10 bg-background border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-md text-foreground/50 hover:text-primary hover:bg-primary/10 transition-[left,colors] duration-300 ease-in-out shadow-sm"
        title={isOpen ? "Nascondi menu" : "Mostra menu"}
        aria-label={isOpen ? "Nascondi menu" : "Mostra menu"}
      >
        <ChevronRight
          size={13}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {/* 
        Spacer invisibile nel flusso del documento:
        occupa lo stesso spazio della sidebar fissa in modo che
        il contenuto principale non finisca sotto di essa.
        Si azzera con una transizione quando la sidebar è chiusa.
      */}
      <div
        style={{ width: isOpen ? `${SIDEBAR_W}px` : "0px" }}
        className="shrink-0 transition-all duration-300 ease-in-out"
        aria-hidden="true"
      />
    </>
  );
}
