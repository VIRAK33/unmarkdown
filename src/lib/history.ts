import { createStore, get, set } from "idb-keyval";

export type Snapshot = {
  content?: string;
  diff?: string;
  savedAt: number;
};

// Use a separate database for history to avoid version conflicts
const historyStore = createStore("unmarkdown-history", "snapshots");

// Track pending snapshot timers per note to debounce to 30 seconds
const pendingSnapshots = new Map<string, ReturnType<typeof setTimeout>>();

export async function deleteHistory(noteId: string): Promise<void> {
  try {
    const { del } = await import("idb-keyval");
    await del(noteId, historyStore);
  }
  catch (error) {
    console.error("Failed to delete history:", error);
  }
}

export async function flushSnapshot(noteId: string, content: string, max = 20): Promise<void> {
  if (pendingSnapshots.has(noteId)) {
    clearTimeout(pendingSnapshots.get(noteId)!);
    pendingSnapshots.delete(noteId);
    await pushSnapshot(noteId, content, max);
  }
}

export async function getSnapshots(noteId: string): Promise<Snapshot[]> {
  try {
    const snapshots = (await get<Snapshot[]>(noteId, historyStore)) ?? [];
    // Return snapshots as-is (diffs are applied when needed)
    return snapshots;
  }
  catch (error) {
    console.error("Failed to get snapshots:", error);
    return [];
  }
}

export async function pushSnapshot(noteId: string, content: string, max = 20): Promise<void> {
  try {
    // Clear existing timer for this note
    if (pendingSnapshots.has(noteId)) {
      clearTimeout(pendingSnapshots.get(noteId)!);
    }

    // Debounce to 5 seconds - only create snapshot if content actually changed
    const timer = setTimeout(async () => {
      try {
        const existing = await get<Snapshot[]>(noteId, historyStore);
        const current = existing ?? [];

        // Check if content changed
        if (current[0]?.content === content) return;

        // Create new snapshot with diff for space efficiency
        let newSnapshot: Snapshot;
        if (current.length === 0) {
          // First snapshot: store full content
          newSnapshot = { content, savedAt: Date.now() };
        }
        else {
          // Subsequent snapshots: store diff from previous
          const prevContent = current[0].content || reconstructContent(current);
          const diff = createDiff(prevContent, content);
          newSnapshot = { content, diff, savedAt: Date.now() };
        }

        const next = [newSnapshot, ...current].slice(0, max);
        await set(noteId, next, historyStore);
      }
      catch (error) {
        console.error("Failed to save snapshot:", error);
      }
      pendingSnapshots.delete(noteId);
    }, 5000); // 5 seconds

    pendingSnapshots.set(noteId, timer);
  }
  catch (error) {
    console.error("Failed to schedule snapshot:", error);
  }
}

// Reconstruct full content from snapshots
export function reconstructContent(snapshots: Snapshot[]): string {
  if (snapshots.length === 0) return "";
  if (!snapshots[snapshots.length - 1].content) return "";

  let content = snapshots[snapshots.length - 1].content!;

  // Apply diffs in reverse order (from base to current)
  for (let i = snapshots.length - 2; i >= 0; i--) {
    if (snapshots[i].diff) {
      content = applyDiff(content, snapshots[i].diff!);
    }
  }

  return content;
}

// Reconstruct content from base + diffs
function applyDiff(baseContent: string, diff: string): string {
  const lines = baseContent.split("\n");
  const changes = diff.split("|").filter(Boolean);

  changes.forEach((change) => {
    const [indexStr, newLine] = change.split(":");
    const index = parseInt(indexStr);
    if (index >= 0) {
      lines[index] = newLine;
    }
  });

  return lines.join("\n");
}

// Simple diff implementation - store line-based changes
function createDiff(oldContent: string, newContent: string): string {
  const oldLines = oldContent.split("\n");
  const newLines = newContent.split("\n");
  const diff: string[] = [];

  let i = 0;
  while (i < Math.max(oldLines.length, newLines.length)) {
    if (oldLines[i] !== newLines[i]) {
      diff.push(`${i}:${newLines[i] || ""}`);
    }
    i++;
  }

  return diff.join("|");
}
