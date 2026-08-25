import { useCallback, useEffect, useState } from "react";
import { Download, Share, Sparkles, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/** Chrome's install prompt event, which TypeScript's DOM lib doesn't define. */
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * How tall the strip is. Mirrored into `--install-bar` so the fixed navbar and
 * the page below it move down by exactly this much — and by nothing at all
 * when there is no strip.
 */
const BAR_HEIGHT = "3.25rem";

const DISMISSED_KEY = "poba-install-banner-dismissed";

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
 * "Install the app now", across the top of the landing page.
 *
 * Unlike the header's `InstallButton`, which hides itself unless the browser
 * has offered installation, this is the page's standing invitation to install
 * and so it stays put. What the button *does* is what varies: Chrome and Edge
 * fire `beforeinstallprompt`, which we hold and replay, and everything else
 * gets the steps for its own menu. That way the strip is always there to be
 * read without ever firing a prompt the browser would refuse.
 *
 * Two things do hide it: running inside the installed app already, and having
 * closed it once. A bar advertising an app you are currently inside is the
 * kind customers learn to scroll past.
 *
 * It reserves its own space through `--install-bar` rather than overlapping
 * the header, so nothing is ever hidden underneath it.
 */
export function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [ios, setIos] = useState(false);
  // Starts hidden and is switched on from an effect, so the server and the
  // first client render agree: neither can know whether this browser has the
  // app installed already.
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Already installed: there is nothing to offer.
    if (isStandalone()) return;

    let closedBefore = false;
    try {
      closedBefore = window.localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      // Private mode or storage turned off. Showing the strip is the safe side
      // of that failure; it is one close away either way.
    }
    if (closedBefore) return;

    setIos(isIosSafari());
    setDismissed(false);

    const onBeforeInstall = (event: Event) => {
      // Stop Chrome's own mini-infobar so this strip is the single entry point.
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setPromptEvent(null);
      setDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const visible = !dismissed;

  // The strip is fixed, so the space it occupies has to be given back to the
  // document explicitly. Cleared on the way out so a dismissal closes the gap
  // with it.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--install-bar", visible ? BAR_HEIGHT : "0px");
    return () => root.style.setProperty("--install-bar", "0px");
  }, [visible]);

  const close = useCallback(() => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Not worth failing the click over; it just asks again next visit.
    }
  }, []);

  const install = useCallback(async () => {
    // No held prompt means this browser never offered one — iOS Safari never
    // does, and Chrome withholds it on a repeat visit. Either way the steps
    // are better than a button that does nothing.
    if (!promptEvent) {
      setShowHelp(true);
      return;
    }
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    // The event is single-use, so drop it either way.
    setPromptEvent(null);
    if (outcome === "accepted") setDismissed(true);
  }, [promptEvent]);

  if (!visible) return null;

  return (
    <>
      <div
        className="fixed inset-x-0 top-0 z-[60] bg-gradient-green text-primary-foreground shadow-lift"
        style={{ height: BAR_HEIGHT }}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4 lg:px-8">
          <span className="hidden size-8 shrink-0 items-center justify-center rounded-lg bg-accent-light/20 text-accent-light sm:flex">
            <Sparkles className="size-4" />
          </span>

          <p className="min-w-0 flex-1 truncate text-xs font-semibold sm:text-sm">
            <span className="font-bold">Install the Poba Express app now</span>
            <span className="hidden text-primary-foreground/70 sm:inline">
              {" "}
              — order faster, and keep it on your home screen.
            </span>
          </p>

          <button
            type="button"
            onClick={() => void install()}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-accent-light px-4 text-xs font-bold text-primary transition-transform duration-200 hover:scale-[1.03] active:scale-95 sm:text-sm"
          >
            <Download className="size-4" />
            Install now
          </button>

          <button
            type="button"
            onClick={close}
            aria-label="Close the install banner"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-primary-foreground/60 transition-colors hover:bg-white/10 hover:text-primary-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Poba Express to your Home Screen</DialogTitle>
            <DialogDescription>
              {ios
                ? "iPhone and iPad install apps from the browser menu rather than a button."
                : "This browser installs apps from its own menu rather than a button."}
            </DialogDescription>
          </DialogHeader>
          {/* Two sets of steps, because naming the wrong menu is worse than
              naming none: iOS Safari has no install API at all, and a browser
              that withheld `beforeinstallprompt` still installs from its menu. */}
          <ol className="mt-1 space-y-3 text-sm text-muted-foreground">
            {(ios
              ? [
                  <>
                    Tap the <Share className="inline size-4 align-text-bottom text-primary" /> Share
                    button in Safari&apos;s toolbar.
                  </>,
                  <>
                    Scroll down and choose{" "}
                    <span className="font-medium text-primary">Add to Home Screen</span>.
                  </>,
                  <>
                    Tap <span className="font-medium text-primary">Add</span>. Poba Express appears
                    on your Home Screen like any other app.
                  </>,
                ]
              : [
                  <>
                    Open your browser&apos;s menu — the{" "}
                    <span className="font-medium text-primary">⋮</span> or{" "}
                    <span className="font-medium text-primary">⋯</span> button in the toolbar.
                  </>,
                  <>
                    Choose <span className="font-medium text-primary">Install app</span>, or{" "}
                    <span className="font-medium text-primary">Add to Home screen</span>.
                  </>,
                  <>
                    Confirm. Poba Express opens in its own window, like any other app on your
                    device.
                  </>,
                ]
            ).map((step, index) => (
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
            onClick={() => setShowHelp(false)}
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
