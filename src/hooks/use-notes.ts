import { useCallback, useEffect, useState } from "react";

import { createNote, type Note, notesDb, titleFromContent } from "@/lib/notes";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<null | string>(null);

  useEffect(() => {
    notesDb.getAll().then((all) => {
      const sorted = all.sort((a, b) => a.createdAt - b.createdAt);
      if (sorted.length === 0) {
        const note = createNote();
        notesDb.save(note).then(() => {
          setNotes([note]);
          setActiveId(note.id);
        });
      }
      else {
        setNotes(sorted);
        setActiveId(sorted[0].id);
      }
    });
  }, []);

  const activeNote = notes.find(n => n.id === activeId) ?? null;

  const addNote = useCallback(() => {
    const note = createNote();
    notesDb.save(note).then(() => {
      setNotes(prev => [...prev, note]);
      setActiveId(note.id);
    });
  }, []);

  const updateNote = useCallback((id: string, content: string) => {
    setNotes(prev =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const updated = { ...n, content, title: titleFromContent(content), updatedAt: Date.now() };
        notesDb.save(updated);
        return updated;
      }),
    );
  }, []);

  const renameNote = useCallback((id: string, title: string) => {
    setNotes(prev =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const updated = { ...n, title };
        notesDb.save(updated);
        return updated;
      }),
    );
  }, []);

  const deleteNote = useCallback(
    (id: string) => {
      notesDb.delete(id).then(() => {
        setNotes((prev) => {
          const next = prev.filter(n => n.id !== id);
          if (activeId === id) {
            setActiveId(next[0]?.id ?? null);
          }
          return next;
        });
      });
    },
    [activeId],
  );

  return {
    activeId,
    activeNote,
    addNote,
    deleteNote,
    notes,
    renameNote,
    setActiveId,
    updateNote,
  };
}
