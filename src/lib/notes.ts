import { createStore, del, entries, get, set } from "idb-keyval";

export type Note = {
  content: string;
  createdAt: number;
  id: string;
  title: string;
  updatedAt: number;
};

const store = createStore("unmarkdown", "notes");

export function createNote(content = ""): Note {
  return {
    content,
    createdAt: Date.now(),
    id: crypto.randomUUID(),
    title: titleFromContent(content) || "Untitled",
    updatedAt: Date.now(),
  };
}

export function titleFromContent(content: string): string {
  const first = content.split("\n").find(l => l.trim());
  if (!first) return "Untitled";
  return first.replace(/^#+\s*/, "").trim() || "Untitled";
}

export const notesDb = {
  delete: (id: string) => del(id, store),
  get: (id: string) => get<Note>(id, store),
  getAll: () => entries<string, Note>(store).then(e => e.map(([, v]) => v)),
  save: (note: Note) => set(note.id, note, store),
};
