import type { Note } from "@/lib/notes";

import { useCodemirror } from "@/hooks/use-codemirror";

type EditorViewProps = {
  note: Note;
  onUpdate: (id: string, content: string) => void;
  vimMode: boolean;
};

export function EditorView({ note, onUpdate, vimMode }: EditorViewProps) {
  const editorRef = useCodemirror({
    initialContent: note.content,
    noteId: note.id,
    onChange: content => onUpdate(note.id, content),
    vimMode,
  });

  return <div className="flex-1 overflow-hidden" ref={editorRef} />;
}
