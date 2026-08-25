import { useCallback, useState } from "react";
import { Download } from "lucide-react";

import { useInstallPrompt } from "@/lib/install";
import { InstallHelpDialog } from "./InstallHelpDialog";

/**
 * "Install app" for the header. Renders nothing unless the browser actually
 * offers installation, so it never advertises something that cannot happen.
 *
 * That restraint is right for a header, where the button sits beside the nav
 * with no room to explain itself. The strip at the top of the page and the
 * order section take the opposite line, because there the invitation is the
 * point — see `InstallBanner`.
 */
export function InstallButton({
  className,
  children,
}: { className?: string; children?: React.ReactNode } = {}) {
  const { installed, ios, canPrompt, promptInstall } = useInstallPrompt();
  const [showHelp, setShowHelp] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleClick = useCallback(async () => {
    const outcome = await promptInstall();
    // iOS Safari has no install API, so it gets the Share steps instead.
    if (outcome === "unavailable") setShowHelp(true);
    if (outcome === "accepted") setAccepted(true);
  }, [promptInstall]);

  // Nothing to offer: installed already, or a browser that cannot install.
  if (installed || accepted || (!canPrompt && !ios)) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => void handleClick()}
        aria-label="Install the Poba Express app"
        className={
          className ||
          "flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-accent"
        }
      >
        {children || (
          <>
            <Download className="size-4" />
            <span className="hidden lg:inline">Install app</span>
          </>
        )}
      </button>

      <InstallHelpDialog open={showHelp} onOpenChange={setShowHelp} ios={ios} />
    </>
  );
}
