import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import type { Theme } from "@/hooks/use-theme";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ onClick, theme }: { onClick: () => void; theme: Theme }) {
  return (
    <button
      aria-label="Toggle theme"
      className={buttonVariants({ size: "icon-xs", variant: "ghost" })}
      onClick={onClick}
      type="button"
    >
      <MonitorIcon className={cn("absolute size-3.5 transition-[opacity,filter,scale] duration-200", theme === "system" ? "opacity-100 scale-100 blur-none" : "pointer-events-none opacity-0 scale-[0.25] blur-xs")} />
      <MoonIcon className={cn("absolute size-3.5 transition-[opacity,filter,scale] duration-200", theme === "dark" ? "opacity-100 scale-100 blur-none" : "pointer-events-none opacity-0 scale-[0.25] blur-xs")} />
      <SunIcon className={cn("absolute size-3.5 transition-[opacity,filter,scale] duration-200", theme === "light" ? "opacity-100 scale-100 blur-none" : "pointer-events-none opacity-0 scale-[0.25] blur-xs")} />
    </button>
  );
}
