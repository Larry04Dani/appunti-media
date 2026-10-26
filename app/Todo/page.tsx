import path from "path";
import type { Metadata } from "next";
import { getAllTodos } from "@/lib/get-todos";
import { TodoDashboard } from "@/components/todo-dashboard";

export const metadata: Metadata = {
  title: "Cose da Continuare | Appunti",
  description:
    "Elenco aggregato di tutte le parti da continuare, dimostrazioni ed esercizi da svolgere nelle varie dispense del sito.",
};

export default function TodoPage() {
  const appPath = path.join(process.cwd(), "app");
  const todos = getAllTodos(appPath);

  return <TodoDashboard initialTodos={todos} />;
}
