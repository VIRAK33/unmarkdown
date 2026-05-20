import { NotebookPenIcon, PlusIcon, RotateCcwIcon, WandSparklesIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Note } from "./lib/notes";

import { Badge } from "./components/ui/badge";
import { Button, buttonVariants } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import { Separator } from "./components/ui/separator";
import { Switch } from "./components/ui/switch";
import { useLocalStorage } from "./hooks/use-local-storage";
import { useNotes } from "./hooks/use-notes";
import { cn } from "./lib/utils";

type RightTab = "outline" | "preview";

export default function App() {
  const [leftPct, setLeftPct] = useLocalStorage("split-pct", 50);
  const [dragging, setDragging] = useState(false);
  const [vimMode, setVimMode] = useLocalStorage("vim-mode", false);
  const [rightTab, setRightTab] = useLocalStorage<RightTab>("right-tab", "preview");
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    activeId,
    activeNote,
    addNote,
    deleteNote,
    notes,
    renameNote,
    setActiveId,
  } = useNotes();

  useEffect(() => {
    if (!dragging) return;

    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const raw = ((e.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(85, Math.max(15, raw));
      setLeftPct(clamped);
    };
    const onUp = () => setDragging(false);

    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [dragging]);

  const leftLabel = Math.round(leftPct);
  const rightLabel = 100 - leftLabel;

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border/60 px-4">
        <span className="font-mono text-xs">
          <span className="text-muted-foreground">UnMarkdown</span>
          <span className="mx-1.5 text-muted-foreground/40">/</span>
          <span className="text-foreground">
            {activeNote?.title ?? "Untitled"}
          </span>
        </span>

        <Separator className="h-5" orientation="vertical" />

        <div className="flex items-center gap-1">
          <Button size="xs" variant="ghost">
            <WandSparklesIcon />
            <span className="font-mono">Format</span>
          </Button>
          <label className="flex cursor-pointer items-center gap-1.5">
            <Switch checked={vimMode} onCheckedChange={v => setVimMode(v)} />
            <span className={`font-mono text-xs transition-colors ${vimMode ? "text-foreground" : "text-muted-foreground"}`}>
              VIM
            </span>
          </label>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge className="font-mono text-[10px] tabular-nums tracking-wider" variant="outline">
            {leftLabel}
            % /
            {rightLabel}
            %
          </Badge>
          <Button
            disabled={leftLabel === 50}
            onClick={() => setLeftPct(50)}
            size="xs"
            variant="ghost"
          >
            <RotateCcwIcon />
            <span className="font-mono">Reset</span>
          </Button>
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden" ref={containerRef}>
        <div
          className="flex shrink-0 flex-col overflow-hidden bg-foreground/2"
          style={{ width: `${leftPct}%` }}
        >
          <EditorPane
            activeId={activeId}
            notes={notes}
            onAdd={addNote}
            onDelete={deleteNote}
            onRename={renameNote}
            onSelect={setActiveId}
          />
        </div>

        <div
          aria-orientation="vertical"
          aria-valuemax={85}
          aria-valuemin={15}
          aria-valuenow={leftLabel}
          className="group relative z-10 w-4 shrink-0 cursor-col-resize"
          onDoubleClick={() => setLeftPct(50)}
          onMouseDown={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          role="separator"
          style={{ background: "linear-gradient(to right, color-mix(in oklch, var(--foreground) 2%, transparent) 50%, transparent 50%)" }}
        >
          <div className={`absolute inset-0 transition-colors duration-150 ${dragging ? "bg-foreground/5" : "group-hover:bg-foreground/3"}`} />
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-px bg-border" />
          <div className={`pointer-events-none absolute top-1/2 left-1/2 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/30 transition-all duration-200 ${dragging ? "h-12 bg-foreground/40 opacity-100" : "h-8 opacity-0 group-hover:opacity-100"}`} />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden bg-background">
          <div className="flex h-9 shrink-0 items-center gap-0.5 border-b border-border/60 px-2">
            {(["preview", "outline"] as RightTab[]).map(tab => (
              <Button
                className={cn(
                  "font-mono capitalize transition-[background-color,color]",
                  rightTab === tab ? "bg-foreground/5 hover:bg-foreground/5" : "hover:bg-transparent",
                )}
                key={tab}
                onClick={() => setRightTab(tab)}
                size="xs"
                variant="ghost"
              >
                {tab}
              </Button>
            ))}
          </div>
          <PreviewPane note={activeNote} tab={rightTab} />
        </div>
      </div>
    </div>
  );
}

function EditorPane({
  activeId,
  notes,
  onAdd,
  onDelete,
  onRename,
  onSelect,
}: {
  activeId: null | string;
  notes: Note[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-9 shrink-0 items-center border-b border-border/60">
        <ScrollArea className="h-9" scrollFade>
          <div className="px-2 flex h-9 items-center gap-0.5">
            {notes.map(note => (
              <NoteTab
                active={activeId === note.id}
                deletable={notes.length > 1}
                key={note.id}
                note={note}
                onDelete={onDelete}
                onRename={onRename}
                onSelect={onSelect}
              />
            ))}
            <Button onClick={onAdd} size="xs" variant="ghost">
              <PlusIcon className="size-3.5" />
            </Button>
          </div>
        </ScrollArea>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <NotebookPenIcon className="size-16 text-muted-foreground/30" strokeWidth={1} />
        <p className="text-sm text-muted-foreground/50">Start writing…</p>
      </div>
    </div>
  );
}

function NoteTab({
  active,
  deletable,
  note,
  onDelete,
  onRename,
  onSelect,
}: {
  active: boolean;
  deletable: boolean;
  note: Note;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onSelect: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed) onRename(note.id, trimmed);
    setEditing(false);
  };

  return (
    <div
      className={cn(
        buttonVariants({ size: "xs", variant: "ghost" }),
        "group shrink-0 cursor-pointer select-none font-mono transition-[background-color,color]",
        active ? "bg-foreground/5 hover:bg-foreground/5" : "text-muted-foreground hover:bg-transparent hover:text-foreground",
      )}
      onClick={() => !editing && onSelect(note.id)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setValue(note.title);
        setEditing(true);
      }}
    >
      <div className="relative">
        <span className={editing ? "invisible" : ""}>{editing ? (value || " ") : note.title}</span>
        {editing && (
          <input
            autoFocus
            className="absolute inset-0 w-full border-none bg-transparent font-mono text-xs outline-none"
            onBlur={commit}
            onChange={e => setValue(e.target.value)}
            onClick={e => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
            ref={inputRef}
            value={value}
          />
        )}
      </div>
      {deletable && (
        <span
          className="-mr-[3px] flex size-3.5 items-center justify-center rounded-sm opacity-0 transition-opacity hover:bg-foreground/10 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          role="button"
        >
          <XIcon className="size-2.5" />
        </span>
      )}
    </div>
  );
}

function PreviewPane({ note, tab }: { note: Note | null; tab: RightTab }) {
  if (!note) return <div className="flex-1" />;

  if (tab === "outline") {
    const headings = note.content
      .split("\n")
      .filter(l => /^#{1,6}\s/.test(l))
      .map((l) => {
        const level = l.match(/^(#+)/)?.[1].length ?? 1;
        const text = l.replace(/^#+\s*/, "");
        return { level, text };
      });

    return (
      <div className="flex-1 overflow-auto p-4">
        {headings.length === 0
          ? (
              <p className="text-sm text-muted-foreground/50">No headings yet.</p>
            )
          : (
              <ul className="space-y-1">
                {headings.map((h, i) => (
                  <li
                    className="cursor-pointer truncate font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                    key={i}
                    style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
                  >
                    {h.text}
                  </li>
                ))}
              </ul>
            )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <p className="text-sm text-muted-foreground/50">Preview</p>
    </div>
  );
}
