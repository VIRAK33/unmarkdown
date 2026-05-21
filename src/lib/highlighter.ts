import type { Highlighter } from "shiki";

import { createHighlighter } from "shiki";

let promise: null | Promise<Highlighter> = null;

export function getHighlighter() {
  if (!promise) {
    promise = createHighlighter({
      langs: [
        "bash",
        "css",
        "diff",
        "go",
        "html",
        "javascript",
        "json",
        "jsx",
        "markdown",
        "python",
        "rust",
        "sh",
        "sql",
        "tsx",
        "typescript",
        "yaml",
      ],
      themes: ["catppuccin-latte", "catppuccin-mocha"],
    });
  }
  return promise;
}
