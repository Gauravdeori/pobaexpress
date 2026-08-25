import { Share } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * How to install by hand, for the browsers that will not be asked.
 *
 * Two sets of steps, because naming the wrong menu is worse than naming none:
 * iOS Safari has no install API at all and installs from Share, while a
 * desktop browser that withheld `beforeinstallprompt` still installs from its
 * own overflow menu.
 */
export function InstallHelpDialog({
  open,
  onOpenChange,
  ios,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ios: boolean;
}) {
  const steps = ios
    ? [
        <>
          Tap the <Share className="inline size-4 align-text-bottom text-primary" /> Share button in
          Safari&apos;s toolbar.
        </>,
        <>
          Scroll down and choose{" "}
          <span className="font-medium text-primary">Add to Home Screen</span>.
        </>,
        <>
          Tap <span className="font-medium text-primary">Add</span>. Poba Express appears on your
          Home Screen like any other app.
        </>,
      ]
    : [
        <>
          Open your browser&apos;s menu — the <span className="font-medium text-primary">⋮</span> or{" "}
          <span className="font-medium text-primary">⋯</span> button in the toolbar.
        </>,
        <>
          Choose <span className="font-medium text-primary">Install app</span>, or{" "}
          <span className="font-medium text-primary">Add to Home screen</span>.
        </>,
        <>Confirm. Poba Express opens in its own window, like any other app on your device.</>,
      ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Poba Express to your Home Screen</DialogTitle>
          <DialogDescription>
            {ios
              ? "iPhone and iPad install apps from the browser menu rather than a button."
              : "This browser installs apps from its own menu rather than a button."}
          </DialogDescription>
        </DialogHeader>
        <ol className="mt-1 space-y-3 text-sm text-muted-foreground">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <Button
          variant="accent"
          className="mt-2 h-12 w-full rounded-2xl"
          onClick={() => onOpenChange(false)}
        >
          Got it
        </Button>
      </DialogContent>
    </Dialog>
  );
}
