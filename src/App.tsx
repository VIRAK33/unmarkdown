import {
  NotebookPenIcon,
  PlusIcon,
  RotateCcwIcon,
  WandSparklesIcon,
} from "lucide-react";
import { Children, isValidElement, useEffect, useLayoutEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { Note } from "./lib/notes";

import { CodeBlock } from "./components/code-block";
import { EditorView } from "./components/editor-view";
import { GitHubButton } from "./components/github-button";
import { NoteTab } from "./components/note-tab";
import { OutlineTree } from "./components/outline-tree";
import { ShareButton } from "./components/share-button";
import { ThemeToggle } from "./components/theme-toggle";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Kbd, KbdGroup } from "./components/ui/kbd";
import { ScrollArea } from "./components/ui/scroll-area";
import { Separator } from "./components/ui/separator";
import { toastManager } from "./components/ui/toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import { useLocalStorage } from "./hooks/use-local-storage";
import { useNotes } from "./hooks/use-notes";
import { useTheme } from "./hooks/use-theme";
import { formatMarkdown } from "./lib/format";
import { parseShareHash } from "./lib/share";
import { cn } from "./lib/utils";

type RightTab = "outline" | "preview";

const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
const altKey = isMac ? "⌥" : "Alt";

export default function App() {
  const [leftPct, setLeftPct] = useLocalStorage("split-pct", 50);
  const [dragging, setDragging] = useState(false);
  const [vimMode, setVimMode] = useLocalStorage("vim-mode", false);
  const [rightTab, setRightTab] = useLocalStorage<RightTab>("right-tab", "preview");
  const [sharedContent] = useState(() => parseShareHash());
  const containerRef = useRef<HTMLDivElement>(null);
  const setEditorContent = useRef<((content: string) => void) | null>(null);

  const {
    activeId,
    activeNote,
    addNote,
    deleteNote,
    importNote,
    notes,
    renameNote,
    setActiveId,
    updateNote,
  } = useNotes();

  const handleFormatRef = useRef<() => void>(() => {});

  async function handleFormat() {
    if (!activeNote || !setEditorContent.current) return;
    const formatted = await formatMarkdown(activeNote.content);
    setEditorContent.current(formatted);
    updateNote(activeNote.id, formatted);
  }

  useLayoutEffect(() => {
    handleFormatRef.current = handleFormat;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      if (e.code === "KeyV") {
        e.preventDefault();
        setVimMode(v => !v);
      }
      if (e.code === "KeyF") {
        e.preventDefault();
        handleFormatRef.current();
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  useEffect(() => {
    if (!sharedContent) return;

    const title = sharedContent.split("\n").find(l => l.trim())?.replace(/^#+\s*/, "").trim() ?? "Untitled";

    const id = setTimeout(() => {
      toastManager.add({
        actionProps: {
          children: "Save",
          onClick: () => {
            importNote(sharedContent);
            history.replaceState(null, "", location.pathname);
          },
        },
        data: { dismissLabel: "Dismiss", onDismiss: () => history.replaceState(null, "", location.pathname) },
        description: `Save "${title}" to your notes`,
        id: "import-shared-note",
        timeout: 1000000,
        title: "Note shared with you",
        type: "info",
      });
    }, 0);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { cycle: cycleTheme, theme } = useTheme();

  const leftLabel = Math.round(leftPct);
  const rightLabel = 100 - leftLabel;

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border/60 px-4">
        <span className="text-xs">
          <span className="text-muted-foreground">UnMarkdown</span>
          <span className="mx-1.5 text-muted-foreground/40">/</span>
          <span className="text-foreground">
            {activeNote?.title ?? "Untitled"}
          </span>
        </span>

        <Separator className="h-5" orientation="vertical" />

        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger render={<Button onClick={handleFormat} size="xs" variant="ghost" />}>
                <WandSparklesIcon />
                Format
              </TooltipTrigger>
              <TooltipContent>
                <KbdGroup>
                  <Kbd>{altKey}</Kbd>
                  <Kbd>F</Kbd>
                </KbdGroup>
              </TooltipContent>
            </Tooltip>

            {activeNote && <ShareButton content={activeNote.content} />}

            <Tooltip>
              <TooltipTrigger render={(
                <Button
                  className={cn(vimMode && "bg-foreground/5 hover:bg-foreground/5")}
                  onClick={() => setVimMode(v => !v)}
                  size="xs"
                  variant="ghost"
                />
              )}
              >
                VIM
              </TooltipTrigger>
              <TooltipContent>
                <KbdGroup>
                  <Kbd>{altKey}</Kbd>
                  <Kbd>V</Kbd>
                </KbdGroup>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <div className="ml-auto flex items-center gap-1">
          <Badge className="text-[10px] tabular-nums tracking-wider" variant="outline">
            {leftLabel}
            % /
            {" "}
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
            Reset
          </Button>
        </div>

        <Separator className="h-5" orientation="vertical" />

        <div className="flex items-center gap-1">
          <GitHubButton />
          <ThemeToggle onClick={cycleTheme} theme={theme} />
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden" ref={containerRef}>
        <div
          className="flex shrink-0 flex-col overflow-hidden bg-foreground/2"
          style={{ width: `${leftPct}%` }}
        >
          <EditorPane
            activeId={activeId}
            activeNote={activeNote}
            notes={notes}
            onAdd={addNote}
            onDelete={deleteNote}
            onEditorReady={(fn) => { setEditorContent.current = fn; }}
            onRename={renameNote}
            onSelect={setActiveId}
            onUpdate={updateNote}
            vimMode={vimMode}
          />
        </div>

        <div
          aria-orientation="vertical"
          aria-valuemax={85}
          aria-valuemin={15}
          aria-valuenow={leftLabel}
          className="group relative z-10 w-px shrink-0 cursor-col-resize overflow-visible"
          onDoubleClick={() => setLeftPct(50)}
          onMouseDown={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          role="separator"
        >
          <div className="absolute inset-y-0 -inset-x-1.5 transition-colors duration-150" />
          <div className="absolute inset-y-0 left-0 w-px bg-border" />
          <div className={`pointer-events-none absolute top-1/2 left-1/2 w-0.75 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/30 transition-all duration-200 ${dragging ? "h-12 bg-foreground/50 opacity-100" : "h-8 opacity-0 group-hover:opacity-100"}`} />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden bg-background">
          <div className="flex h-9 shrink-0 items-center gap-0.5 border-b border-border/60 px-2">
            {(["preview", "outline"] as RightTab[]).map(tab => (
              <Button
                className={cn(
                  "capitalize transition-[background-color,color]",
                  rightTab === tab ? "bg-foreground/5 hover:bg-foreground/5" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
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
          <RightFooter note={activeNote} />
        </div>
      </div>
    </div>
  );
}

function EditorPane({
  activeId,
  activeNote,
  notes,
  onAdd,
  onDelete,
  onEditorReady,
  onRename,
  onSelect,
  onUpdate,
  vimMode,
}: {
  activeId: null | string;
  activeNote: Note | null;
  notes: Note[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onEditorReady: (setContent: (content: string) => void) => void;
  onRename: (id: string, title: string) => void;
  onSelect: (id: string) => void;
  onUpdate: (id: string, content: string) => void;
  vimMode: boolean;
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
            <Button className="hover:bg-foreground/5" onClick={onAdd} size="xs" variant="ghost">
              <PlusIcon className="size-3.5" />
            </Button>
          </div>
        </ScrollArea>
      </div>

      {activeNote
        ? (
            <EditorView
              key={activeNote.id}
              note={activeNote}
              onReady={onEditorReady}
              onUpdate={onUpdate}
              vimMode={vimMode}
            />
          )
        : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              <NotebookPenIcon className="size-16 text-muted-foreground/30" strokeWidth={1} />
              <p className="text-sm text-muted-foreground/50">Start writing…</p>
            </div>
          )}
    </div>
  );
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function PreviewPane({ note, tab }: { note: Note | null; tab: RightTab }) {
  if (!note) return <div className="flex-1" />;

  if (tab === "outline") {
    return (
      <div className="flex-1 overflow-auto">
        <OutlineTree content={note.content} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="prose">
        <Markdown
          components={{
            pre({ children }) {
              type CodeProps = { children?: React.ReactNode; className?: string };
              const codeEl = Children.toArray(children).find(
                child => isValidElement(child) && child.type === "code",
              ) as React.ReactElement<CodeProps> | undefined;
              const lang = (codeEl?.props.className ?? "").replace("language-", "");
              const code = String(codeEl?.props.children ?? "").trimEnd();
              return <CodeBlock code={code} lang={lang} />;
            },
          }}
          remarkPlugins={[remarkGfm]}
        >
          {note.content}
        </Markdown>
      </div>
    </div>
  );
}

function RightFooter({ note }: { note: Note | null }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const wordCount = note
    ? note.content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const lastSaved = note ? formatRelative(note.updatedAt) : null;

  return (
    <div className="flex h-7 shrink-0 items-center justify-between border-t border-border/60 px-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
      <span>{lastSaved ? `Saved ${lastSaved}` : "—"}</span>
      <span className="tabular-nums">
        {wordCount}
        {" "}
        {wordCount === 1 ? "word" : "words"}
      </span>
    </div>
  );
}
