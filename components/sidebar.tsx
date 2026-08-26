"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// Importiamo icone comode per mostrare cartelle, file e bottoni di espansione
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, Menu, X, SidebarClose, SidebarOpen } from "lucide-react";
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
        className={`flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors ${
          isActive ? "bg-primary/10 text-primary font-medium" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {/* Pulsante freccina per espandere/collassare (solo se ci sono figli) */}
        {hasChildren ? (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Espandi cartella"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          // Spazio vuoto per allineare i file che non hanno la freccina
          <div className="w-[18px]" />
        )}

        {/* Icona della cartella (se ha figli) o del file (se è una foglia) */}
        {hasChildren ? (
          isExpanded ? <FolderOpen size={16} className="text-blue-500" /> : <Folder size={16} className="text-blue-500" />
        ) : (
          <FileText size={16} className="text-gray-400" />
        )}

        {/* Nome del nodo. Se ha un URL è un link, altrimenti è solo testo cliccabile per espandere */}
        {node.url ? (
          <Link href={node.url} className="flex-1 truncate text-sm">
            {node.name}
          </Link>
        ) : (
          <span 
            className="flex-1 truncate text-sm cursor-pointer" 
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
        <div className="flex flex-col mt-0.5">
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

  return (
    <>
      {/* 
        Questo contenitore flessibile regola il suo spazio ("width").
        Se `isOpen` è true, la sidebar è larga 256px (w-64).
        Se `isOpen` è false, si restringe a 0px.
        `transition-all` fa sì che l'apertura/chiusura sia un'animazione fluida.
      */}
      <aside 
        className={`relative shrink-0 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${
          isOpen ? "w-64 pr-4 opacity-100" : "w-0 opacity-0 overflow-hidden border-none pr-0"
        }`}
      >
        {/* Pulsante per CHIUDERE la sidebar (visibile solo se aperta) */}
        {isOpen && (
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-0 right-2 p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            title="Nascondi menu"
          >
            <SidebarClose size={18} />
          </button>
        )}

        <nav className="sticky top-8 flex flex-col gap-1 h-[calc(100vh-100px)] overflow-y-auto mt-8">
          {tree.length === 0 ? (
            <p className="text-sm text-gray-500 italic px-2">Nessun appunto trovato.</p>
          ) : (
            tree.map((node, idx) => (
              <SidebarNode key={idx} node={node} />
            ))
          )}
        </nav>
      </aside>

      {/* 
        Pulsante per APRIRE la sidebar.
        Viene mostrato solo se `isOpen` è false (sidebar chiusa).
        Lo fissiamo sulla sinistra, così rimane sempre a portata di clic.
      */}
      {!isOpen && (
        <div className="shrink-0 pt-8 pr-4">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            title="Mostra menu"
          >
            <SidebarOpen size={20} />
          </button>
        </div>
      )}
    </>
  );
}
