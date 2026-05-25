import { RotateCcwIcon, SettingsIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface SettingsDialogProps {
  leftPct: number;
  onReset: () => void;
  onSplitChange: (value: number) => void;
  onVimChange: (value: boolean) => void;
  vimMode: boolean;
}

export default function SettingsDialog({ leftPct, onReset, onSplitChange, onVimChange, vimMode }: SettingsDialogProps) {
  const leftLabel = Math.round(leftPct);

  return (
    <Dialog>
      <DialogTrigger className={buttonVariants({ size: "xs", variant: "ghost" })}>
        <SettingsIcon className="size-3.5" />
      </DialogTrigger>
      <DialogPopup className="font-sans w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Customize your editor preferences.</DialogDescription>
        </DialogHeader>

        <DialogPanel scrollFade={false}>
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-2.5 text-sm font-semibold text-foreground">Editor</p>
              <div className="rounded-xl bg-muted">
                <div className="flex items-center justify-between gap-6 px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold">Vim Mode</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Enable vim keybindings in the editor.</p>
                  </div>
                  <Switch checked={vimMode} onCheckedChange={onVimChange} />
                </div>

                <div className="mx-4">
                  <Separator />
                </div>

                <div className="flex items-center justify-between gap-4 px-4 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Split Ratio</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Adjust the editor and preview pane split.</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      className="size-7"
                      disabled={leftLabel === 50}
                      onClick={onReset}
                      size="icon"
                      variant="ghost"
                    >
                      <RotateCcwIcon className="size-3.5" />
                    </Button>
                    <div className="w-24">
                      <Slider
                        className="**:data-[slot=slider-control]:min-w-0"
                        max={85}
                        min={15}
                        onValueChange={value => onSplitChange(Array.isArray(value) ? value[0] : value)}
                        showTooltip
                        thumbClassName="h-5 w-1.5 sm:h-5 sm:w-1.5 data-[dragging]:scale-110"
                        value={[leftLabel]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
}
