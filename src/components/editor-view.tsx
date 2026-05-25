import { useEffect } from "react";

import type { Note } from "@/lib/notes";

import { useCodemirror } from "@/hooks/use-codemirror";

interface EditorViewProps {
  note: Note;
  onFocusLine?: (focusLine: (line: number) => void) => void;
  onReady?: (setContent: (content: string) => void) => void;
  onUpdate: (id: string, content: string) => void;
  vimMode: boolean;
};

export function EditorView({ note, onFocusLine, onReady, onUpdate, vimMode }: EditorViewProps) {
  const { editorRef, focusLine, setContent } = useCodemirror({
    initialContent: note.content,
    noteId: note.id,
    onChange: content => onUpdate(note.id, content),
    vimMode,
  });

  useEffect(() => {
    onReady?.(setContent);
    onFocusLine?.(focusLine);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className="size-full" ref={editorRef} />;
}
