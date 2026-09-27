"use client";

import React, { createContext, useContext } from "react";
import type { TreeNode } from "@/lib/get-notes-tree";

// Contesto React per rendere l'albero dei file e delle cartelle accessibile
// a qualsiasi componente Client (come la Sidebar e il FolderTree automatico).
const NotesTreeContext = createContext<TreeNode[]>([]);

export function NotesTreeProvider({
  tree,
  children,
}: {
  tree: TreeNode[];
  children: React.ReactNode;
}) {
  return (
    <NotesTreeContext.Provider value={tree}>
      {children}
    </NotesTreeContext.Provider>
  );
}

// Hook personalizzato per consumare l'albero delle note
export function useNotesTree(): TreeNode[] {
  return useContext(NotesTreeContext);
}
