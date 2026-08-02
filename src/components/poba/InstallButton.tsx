import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Chrome's install prompt event, which TypeScript's DOM lib doesn't define. */
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS reports installed apps here rather than through display-mode.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosSafari() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

/**
 * "Install app" for the header. Renders nothing unless the browser actually
 * offers installation, so it never advertises something that cannot happen.
 *
 * Chrome and Edge fire `beforeinstallprompt`, which we hold and replay on
 * click. iOS Safari has no such API — installing there is a manual Share →
 * Add to Home Screen, so it gets instructions instead.
 */
export function InstallButton() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [ios, setIos] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    // Already installed: nothing to offer.
    if (isStandalone()) return;
    setIos(isIosSafari());
    setHidden(false);

    const onBeforeInstall = (event: Event) => {
      // Stop Chrome's own mini-infobar so this button is the single entry point.
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setPromptEvent(null);
      setHidden(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Nothing to offer: installed already, or a browser that cannot install.
  if (hidden || (!promptEvent && !ios)) return null;

  const handleClick = async () => {
    if (ios && !promptEvent) {
      setShowIosHelp(true);
      return;
    }
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    // The event is single-use, so drop it either way.
    setPromptEvent(null);
    if (outcome === "accepted") setHidden(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label="Install the Poba Express app"
        className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-accent"
      >
        <Download className="size-4" />
        <span className="hidden lg:inline">Install app</span>
      </button>

      <Dialog open={showIosHelp} onOpenChange={setShowIosHelp}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Poba Express to your Home Screen</DialogTitle>
            <DialogDescription>
              iPhone and iPad install apps from the browser menu rather than a button.
            </DialogDescription>
          </DialogHeader>
          <ol className="mt-1 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                1
              </span>
              <span>
                Tap the <Share className="inline size-4 align-text-bottom text-primary" /> Share
                button in Safari&apos;s toolbar.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                2
              </span>
              <span>
                Scroll down and choose{" "}
                <span className="font-medium text-primary">Add to Home Screen</span>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                3
              </span>
              <span>
                Tap <span className="font-medium text-primary">Add</span>. Poba Express appears on
                your Home Screen like any other app.
              </span>
            </li>
          </ol>
          <Button
            variant="accent"
            className="mt-2 h-12 w-full rounded-2xl"
            onClick={() => setShowIosHelp(false)}
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
