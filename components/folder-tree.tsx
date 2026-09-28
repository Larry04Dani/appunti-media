"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Folder,
  FolderOpen,
  FolderTree as FolderTreeIcon,
  FileText,
  FileCode,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useNotesTree } from "@/components/notes-tree-provider";
import type { TreeNode } from "@/lib/get-notes-tree";

// ─── TIPI E STRUTTURE DATI ─────────────────────────────────────────────────────
type TreeNodeData = {
  key: string;
  content: React.ReactNode;
  subItems: TreeNodeData[];
  isFolder: boolean;
  isEllipsis: boolean;
  ellipsisNote?: string;
  isCode: boolean;
};

type FolderTreeProps = {
  // Titolo della card (es. "Struttura del corso" o "Albero delle cartelle").
  // Se omesso in modalità automatica, usa "Contenuti di [Nome]" o "Struttura delle cartelle".
  // Passa "" per nascondere la barra superiore del titolo.
  title?: string;
  // Se le cartelle devono partire già espanse di default (default: true)
  defaultExpanded?: boolean;
  // Percorso specifico da esplorare (default: il pathname della pagina corrente)
  path?: string;
  // Se true, forza la modalità automatica anche in presenza di figli
  auto?: boolean;
  // Contenuto: lista Markdown puntata personalizzata OPPURE omesso per generazione automatica
  children?: React.ReactNode;
  // Classi CSS aggiuntive per il contenitore
  className?: string;
};

// ─── FUNZIONI PER LA MODALITÀ AUTOMATICA (DALLE CARTELLE DEL DISCO) ───────────

// Cerca ricorsivamente il nodo corrispondente al pathname nell'albero delle note
function findNodeByPath(
  nodes: TreeNode[],
  targetPath: string
): { name?: string; children?: TreeNode[] } | null {
  let decodedTarget = targetPath;
  try {
    decodedTarget = decodeURIComponent(targetPath);
  } catch {
    // In caso di caratteri non decodificabili, usa targetPath così com'è
  }
  const normalizedTarget = decodedTarget.replace(/\/+$/, "").toLowerCase();

  // Se siamo alla radice "/appunti" o stringa vuota, i figli sono tutti i nodi di primo livello
  if (normalizedTarget === "" || normalizedTarget === "/appunti") {
    return { name: "Appunti", children: nodes };
  }

  for (const node of nodes) {
    const normalizedNode = (node.url || "").replace(/\/+$/, "").toLowerCase();
    if (normalizedNode === normalizedTarget) {
      return node;
    }
    if (node.children) {
      const found = findNodeByPath(node.children, targetPath);
      if (found) return found;
    }
  }
  return null;
}

// Converte un TreeNode (struttura disco da buildTree) in TreeNodeData per il rendering
function convertTreeNodeToData(node: TreeNode, index: number = 0): TreeNodeData {
  const hasSub = !!(node.children && node.children.length > 0);
  const subItems = hasSub
    ? node.children!.map((child, i) => convertTreeNodeToData(child, i))
    : [];

  const nodeKey = node.url || `tree-node-${node.name}-${index}`;

  // Se ha un URL ed è una pagina, rendiamo il testo un link cliccabile
  const contentNode = node.url ? (
    <Link
      key={nodeKey}
      href={node.url}
      onClick={(e) => e.stopPropagation()}
      className="text-foreground hover:text-primary transition-colors underline-offset-2 hover:underline"
    >
      {node.name}
    </Link>
  ) : (
    <span key={nodeKey} className="text-foreground/90">{node.name}</span>
  );

  return {
    key: nodeKey,
    content: contentNode,
    subItems,
    isFolder: hasSub || !node.url,
    isEllipsis: false,
    isCode: false,
  };
}

// ─── FUNZIONI PER IL PARSING DELLA LISTA MARKDOWN MANUALE ─────────────────────

// Estrae il testo grezzo ricorsivamente
function extractPlainText(nodes: React.ReactNode): string {
  let str = "";
  React.Children.forEach(nodes, (node) => {
    if (typeof node === "string" || typeof node === "number") {
      str += String(node);
    } else if (React.isValidElement(node)) {
      const el = node as React.ReactElement<{ children?: React.ReactNode }>;
      if (el.props?.children) {
        str += extractPlainText(el.props.children);
      }
    }
  });
  return str.trim();
}

// Estrae e normalizza i contenuti ignorando i wrapper <p> generati da Markdown
function unpackParagraphs(children: React.ReactNode[]): React.ReactNode[] {
  return children.flatMap((child) => {
    if (React.isValidElement(child)) {
      const el = child as React.ReactElement<{ originalType?: string; children?: React.ReactNode }>;
      if (el.type === "p" || el.props?.originalType === "p") {
        return React.Children.toArray(el.props.children);
      }
    }
    return child;
  });
}

// Estrae i nodi dell'albero a partire dal tag <ul> generato da MDX
function parseTreeList(ulElement: React.ReactNode, parentKey = "manual"): TreeNodeData[] {
  if (!React.isValidElement(ulElement)) return [];
  const ul = ulElement as React.ReactElement<{ children?: React.ReactNode }>;
  const liElements = React.Children.toArray(ul.props.children).filter(React.isValidElement);

  return liElements.map((liNode, idx) => {
    const li = liNode as React.ReactElement<{ children?: React.ReactNode }>;
    const allChildren = unpackParagraphs(React.Children.toArray(li.props.children));
    const itemKey = `${parentKey}-${idx}`;

    // Cerca un eventuale sotto-elenco <ul> annidato
    const nestedUl = allChildren.find(
      (c) =>
        React.isValidElement(c) &&
        (c.type === "ul" || (c as React.ReactElement<{ originalType?: string }>).props?.originalType === "ul")
    );

    const rawContent = allChildren.filter((c) => c !== nestedUl);
    const subItems = nestedUl ? parseTreeList(nestedUl, itemKey) : [];

    const plainText = extractPlainText(rawContent);

    // Controllo se è un segnaposto ellissi (es. "...", "…")
    const isEllipsis = plainText.startsWith("...") || plainText.startsWith("…");

    let ellipsisNote = "";
    if (isEllipsis) {
      ellipsisNote = plainText.replace(/^(\.\.\.|…)\s*/, "").trim();
    }

    // Riconoscimento cartelle
    const isBoldOnly =
      rawContent.length === 1 &&
      React.isValidElement(rawContent[0]) &&
      ((rawContent[0] as React.ReactElement).type === "strong" ||
        (rawContent[0] as React.ReactElement<{ originalType?: string }>).props?.originalType === "strong");

    const isFolder = !isEllipsis && (subItems.length > 0 || plainText.endsWith("/") || isBoldOnly);

    // Riconoscimento file di codice
    const isCode =
      /\.(cpp|c|h|hpp|py|js|ts|tsx|jsx|html|css|json|sh|rs|go|java|md|mdx)$/i.test(plainText);

    // Mappiamo i figli di rawContent con una key esplicita per evitare avvisi di React
    const keyedContent = React.Children.map(rawContent, (child, cIdx) =>
      React.isValidElement(child)
        ? React.cloneElement(child, { key: child.key ?? `${itemKey}-content-${cIdx}` })
        : child
    );

    return {
      key: itemKey,
      content: keyedContent,
      subItems,
      isFolder,
      isEllipsis,
      ellipsisNote,
      isCode,
    };
  });
}

// ─── COMPONENTE SINGOLO NODO: TreeNodeItem ────────────────────────────────────
function TreeNodeItem({
  node,
  defaultExpanded,
}: {
  node: TreeNodeData;
  defaultExpanded: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const hasChildren = node.subItems.length > 0;

  // Nodo ellissi / continuazione: badge con puntini ed eventuale testo aggiuntivo
  if (node.isEllipsis) {
    return (
      <div className="flex items-center gap-2 py-1 px-1.5 text-sm select-none">
        <div className="w-[18px] shrink-0" />
        <span
          className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[11px] font-mono tracking-wider text-foreground/50 bg-gray-100/90 dark:bg-gray-800/80 border border-gray-200/70 dark:border-gray-700/60 shadow-xs"
          title="Continua..."
        >
          ···
        </span>
        {node.ellipsisNote && (
          <span className="text-xs text-foreground/60 italic truncate">
            {node.ellipsisNote}
          </span>
        )}
      </div>
    );
  }

  // Nodo cartella
  if (node.isFolder) {
    return (
      <div className="flex flex-col">
        <div
          onClick={() => hasChildren && setIsOpen((prev) => !prev)}
          className={`group flex items-center gap-1.5 py-1 px-1.5 rounded-md text-sm select-none transition-colors ${
            hasChildren
              ? "cursor-pointer hover:bg-primary/10 hover:text-primary"
              : "text-foreground"
          }`}
        >
          {/* Freccia espandi/comprimi */}
          {hasChildren ? (
            <button
              type="button"
              className="p-0.5 rounded text-foreground/50 group-hover:text-primary shrink-0 transition-transform"
              aria-label={isOpen ? "Comprimi cartella" : "Espandi cartella"}
            >
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className="w-[18px] shrink-0" />
          )}

          {/* Icona della cartella */}
          {isOpen && hasChildren ? (
            <FolderOpen size={16} className="text-primary shrink-0" />
          ) : (
            <Folder size={16} className="text-primary shrink-0" />
          )}

          {/* Nome della cartella */}
          <span className="font-semibold text-foreground/90 group-hover:text-primary truncate">
            {React.Children.map(node.content, (c) => c)}
          </span>
        </div>

        {/* Figli annidati con linea guida dell'albero */}
        {hasChildren && isOpen && (
          <div className="border-l-2 border-gray-200 dark:border-gray-800 ml-3.5 pl-2.5 flex flex-col gap-0.5 mt-0.5">
            {node.subItems.map((sub, idx) => (
              <TreeNodeItem
                key={sub.key || idx}
                node={sub}
                defaultExpanded={defaultExpanded}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Nodo file
  const FileIcon = node.isCode ? FileCode : FileText;

  return (
    <div className="flex items-center gap-1.5 py-1 px-1.5 rounded-md text-sm text-foreground/85 hover:bg-gray-100/70 dark:hover:bg-gray-800/40 transition-colors">
      <div className="w-[18px] shrink-0" />
      <FileIcon size={15} className="text-foreground/50 shrink-0" />
      <span className="truncate">
        {React.Children.map(node.content, (c) => c)}
      </span>
    </div>
  );
}

// ─── COMPONENTE PRINCIPALE: FolderTree ─────────────────────────────────────────
export function FolderTree({
  title,
  defaultExpanded = true,
  path,
  auto,
  children,
  className = "",
}: FolderTreeProps) {
  const pathname = usePathname();
  const fullTree = useNotesTree();

  // Verifichiamo se l'utente ha passato dei figli personalizzati (Markdown)
  const hasCustomChildren = React.Children.count(children) > 0 && !auto;

  let treeNodes: TreeNodeData[] = [];
  let introElements: React.ReactNode[] = [];
  let detectedTitle = title;

  if (hasCustomChildren) {
    // ─── Modalità MANUALE (Markdown passato come children) ───────────────────
    const directChildren = React.Children.toArray(children);
    const ulElements = directChildren.filter(
      (c) =>
        React.isValidElement(c) &&
        (c.type === "ul" || (c as React.ReactElement<{ originalType?: string }>).props?.originalType === "ul")
    );
    introElements = directChildren.filter((c) => !ulElements.includes(c));
    treeNodes = ulElements.flatMap((ul, ulIdx) => parseTreeList(ul, `ul-${ulIdx}`));

    if (detectedTitle === undefined) {
      detectedTitle = "Struttura delle cartelle";
    }
  } else {
    // ─── Modalità AUTOMATICA (Lettura albero note del disco) ────────────────
    const targetPath = path ?? pathname;
    const matchedNode = findNodeByPath(fullTree, targetPath);

    if (matchedNode?.children && matchedNode.children.length > 0) {
      treeNodes = matchedNode.children.map((child, idx) =>
        convertTreeNodeToData(child, idx)
      );
    }

    if (detectedTitle === undefined) {
      detectedTitle = matchedNode?.name
        ? `Contenuti di ${matchedNode.name}`
        : "Struttura delle cartelle";
    }
  }

  return (
    <div
      className={`not-prose my-6 rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm shadow-sm overflow-hidden font-sans ${className}`}
    >
      {/* Intestazione superiore opzionale */}
      {detectedTitle && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-100/70 dark:bg-gray-800/50 border-b border-gray-200/80 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80 tracking-wide uppercase">
            <FolderTreeIcon size={15} className="text-primary" />
            <span>{detectedTitle}</span>
          </div>
        </div>
      )}

      {/* Testo introduttivo opzionale (nella modalità manuale) */}
      {introElements.length > 0 && (
        <div className="px-4 pt-3.5 pb-1 text-sm text-foreground/80 leading-relaxed">
          {React.Children.map(introElements, (el) => el)}
        </div>
      )}

      {/* Contenitore dell'albero dei file e delle cartelle */}
      <div className="p-3 flex flex-col gap-0.5">
        {treeNodes.length > 0 ? (
          treeNodes.map((node, index) => (
            <TreeNodeItem
              key={node.key || `root-${index}`}
              node={node}
              defaultExpanded={defaultExpanded}
            />
          ))
        ) : hasCustomChildren ? (
          <div className="text-sm">{children}</div>
        ) : (
          <div className="flex items-center gap-2 py-2 px-3 text-xs text-foreground/50 italic">
            <Folder size={14} className="text-foreground/40 shrink-0" />
            <span>Nessuna sottocartella presente in questa sezione.</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Alias in italiano per massima comodità
export const StrutturaCartelle = FolderTree;
