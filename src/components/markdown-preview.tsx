import { Children, isValidElement } from "react";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { CodeBlock } from "./code-block";

type MarkdownPreviewProps = {
  content: string;
  onDoubleClick?: (line: number) => void;
};

export default function MarkdownPreview({ content, onDoubleClick }: MarkdownPreviewProps) {
  function handleDoubleClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    const line = target.closest("[data-line]")?.getAttribute("data-line");
    if (line && onDoubleClick) {
      onDoubleClick(parseInt(line, 10));
    }
  }

  return (
    <div onDoubleClick={handleDoubleClick}>
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
        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeLineNumbers]}
        remarkPlugins={[remarkGfm, remarkMath]}
      >
        {content}
      </Markdown>
    </div>
  );
}

function rehypeLineNumbers() {
  return (tree: unknown) => {
    const addLineNumbers = (node: unknown): void => {
      if (node && typeof node === "object" && "type" in node && node.type === "element") {
        const element = node as { children?: unknown[]; position?: { start?: { line?: number } }; properties?: Record<string, unknown> };
        const startLine = element?.position?.start?.line;
        if (startLine) {
          element.properties = element.properties || {};
          element.properties["data-line"] = startLine;
        }
        if (element.children) {
          for (const child of element.children) {
            addLineNumbers(child);
          }
        }
      }
    };
    if (tree && typeof tree === "object" && "children" in tree) {
      for (const child of (tree as { children: unknown[] }).children) {
        addLineNumbers(child);
      }
    }
  };
}
