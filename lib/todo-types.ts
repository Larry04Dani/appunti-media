export type TodoPriority = "alta" | "media" | "bassa";
export type TodoStatus = "todo" | "in-progress" | "done";

export type TodoItem = {
  id: string;
  title: string;
  description: string;
  priority: TodoPriority;
  status: TodoStatus;
  tag?: string;
  pageUrl: string;
  pageTitle: string;
  course: string;
  breadcrumbs: string[];
  filePath: string;
  lineNumber?: number;
};

/**
 * Trasforma una stringa di testo in uno slug valido per ancore HTML (#id).
 * Non ha dipendenze da Node.js ('fs' / 'path') ed è quindi sicuro sia su client che su server.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // rimuove accenti
    .replace(/[^a-z0-9]+/g, "-")     // sostituisce caratteri non alfanumerici con trattini
    .replace(/^-+|-+$/g, "")         // rimuove trattini a inizio e fine
    .slice(0, 50);
}
