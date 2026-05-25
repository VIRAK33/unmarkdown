import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export async function markdownToDocx(markdown: string, title: string): Promise<Blob> {
  return markdownToDocxFallback(markdown, title);
}

export async function markdownToHtml(markdown: string, title: string): Promise<string> {
  try {
    const htmlString = await getHtmlContent(markdown);
    return createStyledHtml(htmlString, title, true);
  }
  catch (error) {
    console.error("HTML generation error:", error);
    throw new Error("Failed to generate HTML", { cause: error });
  }
}

// Create styled HTML matching the preview (Tailwind prose-like styling)
function createStyledHtml(htmlString: string, title: string, includeKatex = true): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet">
      ${includeKatex
        ? `
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.js"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/contrib/auto-render.min.js"></script>
      `
        : ""}
      <link rel="stylesheet" href="https://cdn.tailwindcss.com">
      <style>
        :root {
          --color-text-primary: #1f2937;
          --color-text-secondary: #6b7280;
          --color-heading: #111827;
          --color-border: #e5e7eb;
          --color-bg-light: #f9fafb;
          --color-code-bg: #f3f4f6;
          --color-link: #2563eb;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 16px;
          line-height: 1.75;
          color: var(--color-text-primary);
          background-color: #ffffff;
          padding: 2rem 1.5rem;
        }

        article {
          max-width: 65ch;
          margin: 0 auto;
        }

        h1 {
          font-size: 2.25rem;
          line-height: 2.5rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: var(--color-heading);
          letter-spacing: -0.02em;
        }

        h1:first-child {
          margin-top: 0;
        }

        h2 {
          font-size: 1.875rem;
          line-height: 2.25rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: var(--color-heading);
          letter-spacing: -0.01em;
        }

        h3 {
          font-size: 1.5rem;
          line-height: 2rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
          color: var(--color-heading);
        }

        h4 {
          font-size: 1.125rem;
          line-height: 1.75rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: var(--color-heading);
        }

        h5, h6 {
          font-size: 1rem;
          line-height: 1.75rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: var(--color-heading);
        }

        p {
          margin-bottom: 1.25rem;
          line-height: 1.75;
        }

        a {
          color: var(--color-link);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        a:hover {
          text-decoration: underline;
        }

        strong {
          font-weight: 600;
        }

        em {
          font-style: italic;
        }

        code {
          background-color: var(--color-code-bg);
          color: var(--color-text-primary);
          padding: 0.25em 0.5em;
          border-radius: 0.375rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
          font-size: 0.9em;
          font-weight: 500;
        }

        pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1.25rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.25rem 0;
          line-height: 1.5;
          font-size: 0.875rem;
        }

        pre code {
          background-color: transparent;
          color: #f3f4f6;
          padding: 0;
          border-radius: 0;
          font-weight: normal;
        }

        blockquote {
          border-left: 4px solid var(--color-border);
          padding-left: 1rem;
          padding-right: 1rem;
          margin: 1.25rem 0;
          color: var(--color-text-secondary);
          font-style: italic;
        }

        ul, ol {
          margin-left: 1.5rem;
          margin-bottom: 1.25rem;
        }

        ul {
          list-style-type: disc;
        }

        ol {
          list-style-type: decimal;
        }

        li {
          margin-bottom: 0.5rem;
          line-height: 1.75;
        }

        table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.25rem 0;
          font-size: 0.9375rem;
        }

        table thead {
          border-bottom: 2px solid var(--color-border);
        }

        table th {
          background-color: var(--color-bg-light);
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: var(--color-heading);
          border: 1px solid var(--color-border);
        }

        table td {
          padding: 0.75rem;
          border: 1px solid var(--color-border);
          color: var(--color-text-primary);
        }

        table tbody tr:nth-child(odd) {
          background-color: #ffffff;
        }

        table tbody tr:nth-child(even) {
          background-color: rgba(249, 250, 251, 0.5);
        }

        hr {
          border: none;
          border-top: 1px solid var(--color-border);
          margin: 2rem 0;
        }

        img {
          max-width: 100%;
          height: auto;
          margin: 1.25rem 0;
          border-radius: 0.375rem;
        }

        .katex-display {
          margin: 1.25rem 0;
          overflow-x: auto;
          padding: 0.5rem;
        }

        .katex {
          font-size: 1em;
        }

        /* Print styles */
        @media print {
          body {
            padding: 0.75rem;
            font-size: 14px;
          }

          article {
            max-width: 100%;
          }

          h1 { page-break-after: avoid; }
          h2 { page-break-after: avoid; }
          h3 { page-break-after: avoid; }

          pre { page-break-inside: avoid; }
          table { page-break-inside: avoid; }
          blockquote { page-break-inside: avoid; }

          a { text-decoration: underline; }
        }
      </style>
    </head>
    <body>
      <article>
        <h1>${title}</h1>
        ${htmlString}
      </article>
      ${includeKatex
        ? `
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            renderMathInElement(document.body, {
              delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "\\\\(", right: "\\\\)", display: false},
                {left: "$", right: "$", display: false}
              ],
              throwOnError: false
            });
          });
        </script>
      `
        : ""}
    </body>
    </html>
  `;
}

// Extract math expressions from markdown
function extractMathFromMarkdown(markdown: string): Map<string, string> {
  const mathMap = new Map<string, string>();
  let mathIndex = 0;

  // Extract display math ($$...$$) first
  const displayMathRegex = /\$\$([^$]+?)\$\$/g;
  let match;
  while ((match = displayMathRegex.exec(markdown)) !== null) {
    const formula = match[1].trim();
    if (formula) {
      const key = `__DISPLAY_MATH_${mathIndex}__`;
      mathMap.set(key, formula);
      mathIndex++;
    }
  }

  // Extract inline math ($...$) - more carefully to avoid $$
  // Match $ followed by content that doesn't contain $ or newlines, followed by $
  const inlineMathRegex = /\$([^$\n]+?)\$/g;
  while ((match = inlineMathRegex.exec(markdown)) !== null) {
    const fullMatch = match[0];
    const formula = match[1].trim();

    // Skip if this is part of a $$ (display math)
    if (!fullMatch.startsWith("$$") && !fullMatch.endsWith("$$") && formula.length > 0) {
      const key = `__INLINE_MATH_${mathIndex}__`;
      mathMap.set(key, formula);
      mathIndex++;
    }
  }

  return mathMap;
}

// Shared processor for converting markdown to HTML
async function getHtmlContent(markdown: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex)
    .use(rehypeStringify);

  const htmlResult = await processor.process(markdown);
  return String(htmlResult);
}

// Keep fallback for compatibility
async function markdownToDocxFallback(markdown: string, title: string): Promise<Blob> {
  try {
    // Extract math from markdown first
    const mathMap = extractMathFromMarkdown(markdown);
    const htmlString = await getHtmlContent(markdown);
    const { Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow } = await import("docx");

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(htmlString, "text/html");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const children: any[] = [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
        text: title,
      }),
    ];

    // Helper function to extract math text from KaTeX elements
    const extractMathText = (element: HTMLElement): string => {
      // Try to find aria-label that KaTeX generates (contains the original math)
      const ariaLabel = element.getAttribute("aria-label");
      if (ariaLabel && ariaLabel.length > 1) {
        return `【${ariaLabel}】`;
      }

      // Look for data-* attributes that might contain the original math
      for (const attr of element.attributes) {
        if (attr.name.startsWith("data-") && attr.value.length > 1 && attr.value.length < 150) {
          return `【${attr.value}】`;
        }
      }

      // Try to extract from the HTML structure - look for .katex-mathml content
      const mathml = element.querySelector(".katex-mathml");
      if (mathml) {
        const math = mathml.textContent?.trim();
        if (math && math.length > 1 && math.length < 150) {
          return `【${math}】`;
        }
      }

      // Check if we have a corresponding math expression in our map by partial matching
      const elementText = element.textContent?.trim() || "";
      for (const [, value] of mathMap.entries()) {
        // Try to find a match by checking if element contains parts of the formula
        const formulaParts = value.split(/[\s_{}()]+/);
        if (formulaParts.some(part => part.length > 2 && elementText.includes(part))) {
          return `【${value}】`;
        }
      }

      // Fallback: get text content if it looks like math
      const mathContent = element.textContent?.trim() || "formula";
      if (mathContent.length > 0 && mathContent.length < 100) {
        return `【${mathContent}】`;
      }
      return "【formula】";
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parseElements = (element: Element): any[] => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const elements: any[] = [];
      const tag = element.tagName.toLowerCase();
      const text = element.textContent || "";

      switch (tag) {
        case "blockquote":
          elements.push(
            new Paragraph({
              indent: { left: 720 },
              spacing: { after: 200, line: 360 },
              text: text.trim(),
            }),
          );
          break;
        case "h1":
          elements.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 200, before: 400 },
              text: text.trim(),
            }),
          );
          break;
        case "h2":
          elements.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 150, before: 300 },
              text: text.trim(),
            }),
          );
          break;
        case "h3":
          elements.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_3,
              spacing: { after: 100, before: 200 },
              text: text.trim(),
            }),
          );
          break;
        case "h4":
          elements.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_4,
              spacing: { after: 100, before: 150 },
              text: text.trim(),
            }),
          );
          break;
        case "ol":
        case "ul": {
          const items = element.querySelectorAll("li");
          items.forEach((li) => {
            const bullet = tag === "ul" ? "•" : undefined;
            elements.push(
              new Paragraph({
                indent: { left: 720 },
                spacing: { after: 100, line: 360 },
                text: (bullet ? `${bullet} ` : "") + (li.textContent?.trim() || " "),
              }),
            );
          });
          break;
        }
        case "p": {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pChildren: any = [];
          const hasMath = Array.from(element.childNodes).some(
            node => node.nodeType === Node.ELEMENT_NODE
              && (node as HTMLElement).className.includes("katex"),
          );

          if (hasMath) {
            // Handle paragraphs with math formulas
            element.childNodes.forEach((node) => {
              if (node.nodeType === Node.TEXT_NODE) {
                const textContent = node.textContent?.trim();
                if (textContent) pChildren.push(textContent);
              }
              else if (node.nodeType === Node.ELEMENT_NODE) {
                const child = node as HTMLElement;
                if (child.className.includes("katex-display")) {
                  // Display math - add as separate paragraph
                  if (pChildren.length > 0) {
                    elements.push(
                      new Paragraph({
                        spacing: { after: 100, line: 360 },
                        text: pChildren.join(" ").trim(),
                      }),
                    );
                    pChildren.length = 0;
                  }
                  const mathText = extractMathText(child);
                  elements.push(
                    new Paragraph({
                      indent: { left: 200 },
                      spacing: { after: 100, before: 100, line: 360 },
                      text: mathText,
                    }),
                  );
                }
                else if (child.className.includes("katex")) {
                  // Inline math
                  const mathText = extractMathText(child);
                  pChildren.push(mathText);
                }
                else {
                  const childText = child.textContent?.trim();
                  if (childText) pChildren.push(childText);
                }
              }
            });
          }
          else {
            // Regular paragraph without math
            element.childNodes.forEach((node) => {
              if (node.nodeType === Node.TEXT_NODE) {
                const textContent = node.textContent?.trim();
                if (textContent) pChildren.push(textContent);
              }
              else if (node.nodeType === Node.ELEMENT_NODE) {
                const childText = (node as HTMLElement).textContent?.trim();
                if (childText) pChildren.push(childText);
              }
            });
          }

          if (pChildren.length > 0) {
            elements.push(
              new Paragraph({
                spacing: { after: 200, line: 360 },
                text: pChildren.join(" ").trim(),
              }),
            );
          }
          break;
        }
        case "pre":
          elements.push(
            new Paragraph({
              spacing: { after: 200, line: 280 },
              text: text.trim(),
            }),
          );
          break;
        case "table": {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rows: any[] = [];
          const tableRows = element.querySelectorAll("tr");
          tableRows.forEach((tr) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cells: any[] = [];
            const tableCells = tr.querySelectorAll("td, th");
            tableCells.forEach((td) => {
              cells.push(
                new TableCell({
                  children: [

                    new Paragraph({
                      text: td.textContent?.trim() || " ",
                    }),
                  ],
                }),
              );
            });
            rows.push(new TableRow({ children: cells }));
          });
          if (rows.length > 0) {
            elements.push(
              new Table({
                rows,
                width: { size: 100, type: "pct" },
              }),
            );
          }
          break;
        }
        default:
          if (text.trim()) {
            elements.push(
              new Paragraph({
                spacing: { after: 100 },
                text: text.trim(),
              }),
            );
          }
      }

      return elements;
    };

    htmlDoc.body.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        children.push(...parseElements(node as Element));
      }
    });

    const doc = new Document({
      sections: [
        {
          children: children.length > 0 ? children : [new Paragraph({ text: "No content" })],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    return blob;
  }
  catch (error) {
    console.error("Fallback DOCX generation error:", error);
    throw new Error("Failed to generate DOCX", { cause: error });
  }
}
