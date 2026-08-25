import { useCallback, useEffect, useState } from "react";
import { Download, Sparkles, X } from "lucide-react";

import { useInstallPrompt } from "@/lib/install";
import { InstallHelpDialog } from "./InstallHelpDialog";

/**
 * How tall the strip is. Mirrored into `--install-bar` so the fixed navbar and
 * the page below it move down by exactly this much — and by nothing at all
 * when there is no strip.
 */
const BAR_HEIGHT = "3.25rem";

const DISMISSED_KEY = "poba-install-banner-dismissed";

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
 * It reserves its height through `--install-bar` rather than overlapping the
 * header, so nothing is ever hidden underneath it.
 */
export function InstallBanner() {
  const { installed, ios, promptInstall } = useInstallPrompt();
  const [showHelp, setShowHelp] = useState(false);
  // Starts closed so the server and the first client render agree, then opens
  // from an effect unless this browser has been told no once already.
  const [closed, setClosed] = useState(true);

  useEffect(() => {
    let closedBefore = false;
    try {
      closedBefore = window.localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      // Private mode or storage turned off. Showing the strip is the safe side
      // of that failure; it is one close away either way.
    }
    if (!closedBefore) setClosed(false);
  }, []);

  const visible = !closed && !installed;

  // The strip is fixed, so the space it occupies has to be given back to the
  // document explicitly. Cleared on the way out so a dismissal closes the gap
  // with it.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--install-bar", visible ? BAR_HEIGHT : "0px");
    return () => root.style.setProperty("--install-bar", "0px");
  }, [visible]);

  const close = useCallback(() => {
    setClosed(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Not worth failing the click over; it just asks again next visit.
    }
  }, []);

  const install = useCallback(async () => {
    const outcome = await promptInstall();
    // No prompt to replay means the browser never offered one — iOS Safari
    // never does, and Chrome withholds it on a repeat visit. The steps beat a
    // button that does nothing.
    if (outcome === "unavailable") setShowHelp(true);
    if (outcome === "accepted") setClosed(true);
  }, [promptInstall]);

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

      <InstallHelpDialog open={showHelp} onOpenChange={setShowHelp} ios={ios} />
    </>
  );
}
