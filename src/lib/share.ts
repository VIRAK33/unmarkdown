import { deflateSync, inflateSync, strFromU8, strToU8 } from "fflate";

export function buildShareURL(content: string): string {
  return `${location.origin}${location.pathname}#share=${compressToURL(content)}`;
}

export function compressToURL(content: string): string {
  const compressed = deflateSync(strToU8(content), { level: 9 });
  const b64 = btoa(String.fromCharCode(...compressed));
  return encodeURIComponent(b64);
}

export function decompressFromURL(encoded: string): string {
  const b64 = decodeURIComponent(encoded);
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return strFromU8(inflateSync(bytes));
}

export function parseShareHash(): null | string {
  const hash = location.hash;
  if (!hash.startsWith("#share=")) return null;
  try {
    return decompressFromURL(hash.slice("#share=".length));
  }
  catch {
    return null;
  }
}
