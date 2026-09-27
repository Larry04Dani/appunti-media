"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { TreeNode } from "@/lib/get-notes-tree";

type NotesTreeContextType = {
  tree: TreeNode[];
  validRoutes: string[];
};

// Contesto React per rendere l'albero dei file e l'elenco delle rotte valide accessibili
// a tutti i componenti Client (Sidebar, FolderTree, Breadcrumbs).
const NotesTreeContext = createContext<NotesTreeContextType>({
  tree: [],
  validRoutes: [],
});

export function NotesTreeProvider({
  tree,
  validRoutes,
  children,
}: {
  tree: TreeNode[];
  validRoutes?: string[];
  children: React.ReactNode;
}) {
  // Se validRoutes non è passato esplicitamente, estraiamo gli URL validi dai nodi dell'albero
  const routes = useMemo(() => {
    if (validRoutes && validRoutes.length > 0) return validRoutes;
    const collected: string[] = ["/", "/About", "/Templates"];
    function extract(nodes: TreeNode[]) {
      for (const node of nodes) {
        if (node.url) collected.push(node.url);
        if (node.children) extract(node.children);
      }
    }
    extract(tree);
    return collected;
  }, [validRoutes, tree]);

  return (
    <NotesTreeContext.Provider value={{ tree, validRoutes: routes }}>
      {children}
    </NotesTreeContext.Provider>
  );
}

// Hook per ottenere l'albero delle note
export function useNotesTree(): TreeNode[] {
  return useContext(NotesTreeContext).tree;
}

// Hook per ottenere l'elenco di tutte le rotte che hanno una pagina effettiva (evita 404 nei breadcrumbs)
export function useValidRoutes(): string[] {
  return useContext(NotesTreeContext).validRoutes;
}
