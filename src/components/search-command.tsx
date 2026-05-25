import { useMemo, useState } from "react";

import type { Note } from "@/lib/notes";

import { CommandDialog, CommandDialogPopup } from "./ui/command";
import { Kbd, KbdGroup } from "./ui/kbd";
import { ScrollArea } from "./ui/scroll-area";

interface SearchCommandProps {
  notes: Note[];
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string, lineNumber?: number) => void;
  open: boolean;
}

type SearchResult = { note: Note; snippet: null | string };

export function SearchCommand({ notes, onOpenChange, onSelect, open }: SearchCommandProps) {
  const [query, setQuery] = useState("");

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return notes.map(n => ({ note: n, snippet: null }));

    const q = query.toLowerCase();
    return notes
      .filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .map((n) => {
        const idx = n.content.toLowerCase().indexOf(q);
        let snippet: null | string = null;
        if (idx >= 0) {
          const start = Math.max(0, idx - 20);
          const end = idx + 60;
          const text = n.content.slice(start, end).trim();
          snippet = (start > 0 ? "…" : "") + text + (end < n.content.length ? "…" : "");
        }
        return { note: n, snippet };
      });
  }, [query, notes]);

  const handleSelect = (noteId: string) => {
    // Find the line number where the search query appears
    const note = notes.find(n => n.id === noteId);
    let lineNumber: number | undefined;

    if (note && query.trim()) {
      const lines = note.content.split("\n");
      const lowerQuery = query.toLowerCase();
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(lowerQuery)) {
          lineNumber = i + 1;
          break;
        }
      }
    }

    onSelect(noteId, lineNumber);
    setQuery("");
    onOpenChange(false);
  };

  return (
    <CommandDialog onOpenChange={onOpenChange} open={open}>
      <CommandDialogPopup>
        <div className="flex flex-col h-full">
          <div className="px-2.5 py-1.5 border-b">
            <input
              autoFocus
              className="w-full bg-transparent px-2 py-1.5 text-sm outline-none"
              onChange={e => setQuery(e.target.value)}
              placeholder="Search notes…"
              type="text"
              value={query}
            />
          </div>
          <ScrollArea className="flex-1">
            {results.length === 0
              ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No notes found.
                  </div>
                )
              : (
                  <div className="divide-y">
                    {results.map(result => (
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-foreground/5 active:bg-foreground/10 transition-colors"
                        key={result.note.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSelect(result.note.id);
                        }}
                      >
                        <div className="font-medium text-sm">{result.note.title}</div>
                        {result.snippet && (
                          <div className="text-xs text-muted-foreground truncate max-w-md mt-1">
                            {result.snippet}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
          </ScrollArea>
          <div className="border-t px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>↑↓ navigate | ↵ open</span>
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </div>
        </div>
      </CommandDialogPopup>
    </CommandDialog>
  );
}
