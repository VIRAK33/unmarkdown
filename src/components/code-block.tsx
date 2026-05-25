import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { highlight } from "@/lib/highlighter";
import { cn } from "@/lib/utils";

export function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [html, setHtml] = useState<null | string>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!lang) return;
    highlight(code, lang).then(setHtml).catch(() => setHtml(null));
  }, [code, lang]);

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="group relative mb-5 mx-0.5">
      <button
        aria-label={copied ? "Copied" : "Copy code"}
        className={cn(buttonVariants({ size: "icon-xs", variant: "ghost" }), "absolute top-2 right-2 z-10 opacity-0 transition-opacity duration-150 group-hover:opacity-100")}
        onClick={copy}
        type="button"
      >
        <CheckIcon
          className={cn(
            "absolute size-3 transition-[opacity,filter,scale] duration-300 ease-in-out",
            copied ? "scale-100 opacity-100 blur-none" : "scale-[0.25] opacity-0 blur-sm",
          )}
        />
        <CopyIcon
          className={cn(
            "size-3 transition-[opacity,filter,scale] duration-300 ease-in-out",
            copied ? "scale-[0.25] opacity-0 blur-sm" : "scale-100 opacity-100 blur-none",
          )}
        />
      </button>
      {html
        ? (
            <div
              className="shiki-wrap"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )
        : (
            <pre>
              <code>{code}</code>
            </pre>
          )}
    </div>
  );
}
