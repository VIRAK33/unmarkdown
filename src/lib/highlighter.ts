import { bundledLanguages, bundledThemes } from "shiki/bundle/full";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

type BundledLanguage = keyof typeof bundledLanguages;

const ALIASES: Record<string, BundledLanguage> = {
  cjs: "javascript",
  js: "javascript",
  mjs: "javascript",
  py: "python",
  rb: "ruby",
  rs: "rust",
  sh: "bash",
  ts: "typescript",
  yml: "yaml",
  zsh: "bash",
};

let promise: null | ReturnType<typeof createHighlighterCore> = null;

function init() {
  if (!promise) {
    promise = createHighlighterCore({
      engine: createJavaScriptRegexEngine({ forgiving: true }),
      langs: [],
      themes: [
        bundledThemes["catppuccin-latte"],
        bundledThemes["catppuccin-mocha"],
      ],
    });
  }
  return promise;
}

const loading = new Set<string>();

export async function highlight(code: string, lang: string): Promise<null | string> {
  const hl = await init();

  const resolved = ALIASES[lang] ?? (lang in bundledLanguages ? lang as BundledLanguage : null);
  if (!resolved) return null;

  const bundledLang = resolved;

  if (!hl.getLoadedLanguages().includes(bundledLang)) {
    if (!loading.has(bundledLang)) {
      loading.add(bundledLang);
      await hl.loadLanguage(bundledLanguages[bundledLang]).finally(() => loading.delete(bundledLang));
    }
    else {
      while (loading.has(bundledLang)) {
        await new Promise(r => setTimeout(r, 20));
      }
    }
  }

  return hl.codeToHtml(code, {
    defaultColor: false,
    lang: bundledLang,
    themes: { dark: "catppuccin-mocha", light: "catppuccin-latte" },
  });
}
