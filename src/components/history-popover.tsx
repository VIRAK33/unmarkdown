import { ClockIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { getSnapshots, reconstructContent, type Snapshot } from "@/lib/history";

import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { RelativeTime } from "./ui/relative-time";
import { ScrollArea } from "./ui/scroll-area";

interface HistoryPopoverProps {
  noteId: string;
  onRestore: (content: string) => void;
}

export function HistoryPopover({ noteId, onRestore }: HistoryPopoverProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    getSnapshots(noteId).then(setSnapshots);
  }, [open, noteId]);

  const handleRestore = (content: string) => {
    onRestore(content);
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger>
        <div className="inline-flex items-center justify-center rounded-md hover:bg-foreground/5 transition-colors active:bg-foreground/10 cursor-pointer" style={{ height: "20px", width: "20px" }} title="Version history">
          <ClockIcon className="size-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" side="top">
        <ScrollArea className="h-64">
          <div className="flex flex-col divide-y">
            {snapshots.length === 0
              ? (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    No history yet
                  </div>
                )
              : snapshots.map((snapshot, idx) => {
                  const content = snapshot.content || reconstructContent(snapshots.slice(0, idx + 1));
                  return (
                    <button
                      className="flex flex-col gap-1 border-none bg-transparent px-3 py-2 text-left text-xs transition-colors hover:bg-foreground/5 active:bg-foreground/10"
                      key={idx}
                      onClick={() => handleRestore(content)}
                    >
                      <div className="text-muted-foreground">
                        <RelativeTime timestamp={snapshot.savedAt} />
                      </div>
                      <div className="max-h-12 overflow-hidden text-ellipsis text-[10px] opacity-60 line-clamp-2">
                        {content.split("\n")[0] || "(empty note)"}
                      </div>
                    </button>
                  );
                })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
