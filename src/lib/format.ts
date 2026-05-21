import { remark } from "remark";
import remarkGfm from "remark-gfm";

const processor = remark().use(remarkGfm);

export async function formatMarkdown(content: string): Promise<string> {
  const result = await processor.process(normalizeFences(content));
  return String(result);
}

function normalizeFences(content: string): string {
  const lines = content.split("\n");
  const result: string[] = [];
  let inFence = false;
  let indent = 0;
  let fenceChar = "";

  for (const line of lines) {
    if (!inFence) {
      const m = line.match(/^(\s*)(```+|~~~+)(.*)/);
      if (m) {
        inFence = true;
        indent = m[1].length;
        fenceChar = m[2][0];
        result.push(line.slice(indent));
      }
      else {
        result.push(line);
      }
    }
    else {
      const m = line.match(/^(\s*)(```+|~~~+)\s*$/);
      if (m && m[2][0] === fenceChar) {
        inFence = false;
      }
      result.push(line.slice(indent));
    }
  }

  return result.join("\n");
}
