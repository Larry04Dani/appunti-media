import fs from "fs";
import path from "path";
import { cache } from "react";
import {
  type TodoPriority,
  type TodoStatus,
  type TodoItem,
  slugify,
} from "./todo-types";

export type { TodoPriority, TodoStatus, TodoItem };
export { slugify };

let cachedTodos: { key: string; time: number; data: TodoItem[] } | null = null;

/**
 * Normalizza il valore di priorità passato come attributo.
 */
function normalizePriority(val?: string | boolean): TodoPriority {
  if (typeof val !== "string") return "media";
  const lower = val.toLowerCase().trim();
  if (lower === "alta" || lower === "high" || lower === "urgente") return "alta";
  if (lower === "bassa" || lower === "low") return "bassa";
  return "media";
}

/**
 * Normalizza lo stato passato come attributo.
 */
function normalizeStatus(
  statusVal?: string | boolean,
  doneVal?: string | boolean,
  completedVal?: string | boolean
): TodoStatus {
  if (doneVal === true || completedVal === true) return "done";
  if (typeof statusVal !== "string") return "todo";
  const lower = statusVal.toLowerCase().trim();
  if (lower === "done" || lower === "completato" || lower === "completata" || lower === "fatto") {
    return "done";
  }
  if (lower === "in-progress" || lower === "in_progress" || lower === "in-corso" || lower === "in corso") {
    return "in-progress";
  }
  return "todo";
}

/**
 * Estrae gli attributi da una stringa raw di parametri JSX.
 */
function parseAttributes(raw: string): Record<string, string | boolean> {
  const attrs: Record<string, string | boolean> = {};
  if (!raw) return attrs;

  // Riconosce key="value", key='value', key={value} o attributi booleani semplici
  const attrRegex = /([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}))?/g;
  let match;
  while ((match = attrRegex.exec(raw)) !== null) {
    const key = match[1];
    let val: string | boolean = true;
    if (match[2] !== undefined) {
      val = match[2];
    } else if (match[3] !== undefined) {
      val = match[3];
    } else if (match[4] !== undefined) {
      const trimmed = match[4].trim();
      if (trimmed === "true") val = true;
      else if (trimmed === "false") val = false;
      else if (
        (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ) {
        val = trimmed.slice(1, -1);
      } else {
        val = trimmed;
      }
    }
    attrs[key] = val;
  }
  return attrs;
}

/**
 * Estrae il titolo leggibile della pagina dal frontmatter o dal primo `# Titolo`.
 */
function extractPageTitle(content: string, fallback: string): string {
  // 1. Cerca nel frontmatter YAML
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fmMatch) {
    const titleMatch = fmMatch[1].match(/^title:\s*["']?([^"'\r\n]+)["']?/m);
    if (titleMatch) return titleMatch[1].trim();
  }

  // 2. Cerca il primo titolo di livello 1 (# Titolo)
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].replace(/[*_`]/g, "").trim();
  }

  return fallback;
}

/**
 * Deriva il nome del corso/materia e le briciole di pane (breadcrumbs) dal percorso URL.
 */
function extractCourseAndBreadcrumbs(urlPath: string): {
  course: string;
  breadcrumbs: string[];
} {
  const parts = urlPath.split("/").filter(Boolean);
  const breadcrumbs = parts.map((p) => p.replace(/-/g, " "));

  // Se è sotto /Appunti/1-Anno/1-Semestre/NomeMateria/...
  if (parts.length >= 4 && parts[0] === "Appunti") {
    const course = parts[3].replace(/-/g, " ");
    return { course, breadcrumbs };
  } else if (parts.length >= 2 && parts[0] === "Appunti") {
    const course = parts[1].replace(/-/g, " ");
    return { course, breadcrumbs };
  }

  const course = breadcrumbs[breadcrumbs.length - 1] || "Generale";
  return { course, breadcrumbs };
}

/**
 * Scansiona ricorsivamente una cartella alla ricerca di tutti i file .mdx
 * ed estrae tutti i tag <Todo> e <DaFare>.
 */
function _getAllTodos(dirPath: string, basePath = ""): TodoItem[] {
  if (!fs.existsSync(dirPath)) return [];

  const todos: TodoItem[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (
      entry.name.startsWith(".") ||
      entry.name === "node_modules" ||
      entry.name.startsWith("(") ||
      entry.name === "Todo" || // evita di auto-analizzare la cartella /Todo
      entry.name.toLowerCase() === "templates" || // esclude completamente la pagina /Templates
      entry.name.toLowerCase() === "template"
    ) {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const subTodos = _getAllTodos(fullPath, `${basePath}/${entry.name}`);
      todos.push(...subTodos);
    } else if (entry.name === "page.mdx") {
      const pageUrl = basePath || "/";

      // Sicurezza ulteriore: se l'URL della pagina appartiene a Templates, non raccogliere i TODO
      if (pageUrl.toLowerCase().startsWith("/templates")) {
        continue;
      }

      try {
        const fileContent = fs.readFileSync(fullPath, "utf-8");
        const fallbackTitle = path.basename(dirPath).replace(/-/g, " ");
        const pageTitle = extractPageTitle(fileContent, fallbackTitle);
        const { course, breadcrumbs } = extractCourseAndBreadcrumbs(pageUrl);

        // Regex per intercettare <Todo ...>...</Todo> o <Todo .../>
        // (e l'alias italiano <DaFare ...>)
        const todoRegex =
          /<(Todo|DaFare)\b((?:[^>"']|"[^"]*"|'[^']*')*?)(?:\/>|>([\s\S]*?)<\/\1>)/gi;

        let match: RegExpExecArray | null;
        let indexOnPage = 0;

        while ((match = todoRegex.exec(fileContent)) !== null) {
          const rawAttrs = match[2] || "";
          const attrs = parseAttributes(rawAttrs);

          // Se contrassegnato esplicitamente come demo, esempio o da ignorare, salta
          if (attrs.demo === true || attrs.ignore === true || attrs.example === true) {
            continue;
          }

          indexOnPage++;
          const rawChildren = (match[3] || "").trim();

          // Calcola il numero di riga
          const matchIndex = match.index;
          const lineNumber =
            fileContent.substring(0, matchIndex).split("\n").length;

          // Determina titolo e descrizione
          let title = typeof attrs.title === "string" ? attrs.title.trim() : "";
          let description =
            typeof attrs.description === "string" ? attrs.description.trim() : "";

          if (!title && rawChildren) {
            // Se non c'è title esplicito, usa i primi caratteri dei children come titolo
            const firstLine = rawChildren.split("\n")[0].trim();
            if (firstLine.length <= 60 && !rawChildren.includes("\n")) {
              title = firstLine;
              description = "";
            } else {
              title = firstLine.length <= 60 ? firstLine : `${firstLine.slice(0, 57)}...`;
              description = rawChildren;
            }
          } else if (rawChildren) {
            description = rawChildren;
          }

          if (!title) {
            title = "Elemento da completare";
          }

          // Determina o genera l'ID per l'ancora
          const explicitId = typeof attrs.id === "string" ? attrs.id.trim() : undefined;
          const generatedId =
            explicitId ||
            slugify(title) ||
            `todo-${indexOnPage}`;

          const priority = normalizePriority(attrs.priority);
          const status = normalizeStatus(attrs.status, attrs.done, attrs.completed);
          const tag =
            typeof attrs.tag === "string"
              ? attrs.tag
              : typeof attrs.category === "string"
              ? attrs.category
              : undefined;

          todos.push({
            id: generatedId,
            title,
            description,
            priority,
            status,
            tag,
            pageUrl,
            pageTitle,
            course,
            breadcrumbs,
            filePath: fullPath,
            lineNumber,
          });
        }
      } catch (err) {
        console.error(`Errore durante la lettura dei Todo in ${fullPath}:`, err);
      }
    }
  }

  // Ordina: prima le priorità alte, poi medie, poi basse; a parità, per corso e pagina
  const priorityOrder: Record<TodoPriority, number> = {
    alta: 1,
    media: 2,
    bassa: 3,
  };

  return todos.sort((a, b) => {
    // Prima i non-completati
    if (a.status === "done" && b.status !== "done") return 1;
    if (a.status !== "done" && b.status === "done") return -1;

    // Poi per priorità
    const prioDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (prioDiff !== 0) return prioDiff;

    // Poi per corso
    return a.course.localeCompare(b.course);
  });
}

/**
 * Scansiona ricorsivamente una cartella alla ricerca di tutti i file .mdx
 * ed estrae tutti i tag <Todo> e <DaFare>.
 * Include memorizzazione in cache per evitare continue riletture di tutti i file MDX.
 */
export const getAllTodos = cache((dirPath: string, basePath = ""): TodoItem[] => {
  const now = Date.now();
  const cacheKey = `${dirPath}:${basePath}`;
  if (cachedTodos && cachedTodos.key === cacheKey && now - cachedTodos.time < 3000) {
    return cachedTodos.data;
  }
  const result = _getAllTodos(dirPath, basePath);
  cachedTodos = { key: cacheKey, time: now, data: result };
  return result;
});
