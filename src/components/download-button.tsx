import { Download, FileCode2Icon, FileTextIcon, Printer } from "lucide-react";

import { toastManager } from "@/components/ui/toast";
import { markdownToDocx, markdownToHtml } from "@/lib/markdown-to-formats";

import { buttonVariants } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/menu";

interface DownloadButtonProps {
  content: string;
  title: string;
}

export function DownloadButton({ content, title }: DownloadButtonProps) {
  function downloadMarkdown() {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "untitled"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toastManager.add({ id: "download-md", title: "Downloaded as Markdown", type: "success" });
  }

  async function downloadHTML() {
    try {
      const htmlContent = await markdownToHtml(content, title);
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "untitled"}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toastManager.add({ id: "download-html", title: "Downloaded as HTML", type: "success" });
    }
    catch (error) {
      console.error("Failed to render HTML:", error);
      toastManager.add({ id: "download-html-error", title: "Failed to export HTML", type: "error" });
    }
  }

  async function handlePrint() {
    try {
      const htmlContent = await markdownToHtml(content, title);
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toastManager.add({ id: "print-error", title: "Failed to open print dialog", type: "error" });
        return;
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
      }, 500);

      toastManager.add({ id: "print", title: "Opening print dialog...", type: "success" });
    }
    catch (error) {
      console.error("Failed to open print dialog:", error);
      toastManager.add({ id: "print-error", title: "Failed to open print dialog", type: "error" });
    }
  }

  async function downloadDocx() {
    try {
      const docxBlob = await markdownToDocx(content, title);
      const url = URL.createObjectURL(docxBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "untitled"}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toastManager.add({ id: "download-docx", title: "Downloaded as DOCX", type: "success" });
    }
    catch (error) {
      console.error("Failed to render DOCX:", error);
      toastManager.add({ id: "download-docx-error", title: "Failed to export DOCX", type: "error" });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ size: "xs", variant: "ghost" })}>
        <Download className="size-3.5" />
        Download
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" sideOffset={6}>
        <DropdownMenuItem className="text-xs!" onClick={downloadMarkdown}>
          <FileTextIcon className="size-3.5 opacity-60" />
          Markdown (.md)
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs!" onClick={downloadHTML}>
          <FileCode2Icon className="size-3.5 opacity-60" />
          HTML (.html)
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs!" onClick={handlePrint}>
          <Printer className="size-3.5 opacity-60" />
          Print (PDF)
        </DropdownMenuItem>
        <DropdownMenuItem className="text-xs!" onClick={downloadDocx}>
          <FileCode2Icon className="size-3.5 opacity-60" />
          Word (.docx)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
