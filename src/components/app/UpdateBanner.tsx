import { RefreshCw } from "lucide-react";

import { useAppUpdate } from "@/lib/app-update";

/**
 * "A new version is ready", for someone who is looking at the screen.
 *
 * Only ever a prompt, never a reload out from under them: a refresh while
 * someone is halfway through typing an address would throw the address away.
 * If they ignore it, the update applies itself the moment they switch away.
 *
 * Sat above the cart bar and the tab bar rather than over either, so it can
 * never cover the control someone was reaching for.
 */
export function UpdateBanner() {
  const { ready, apply } = useAppUpdate();
  if (!ready) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-[calc(9rem+env(safe-area-inset-bottom))] z-40 px-4"
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-lift">
        <RefreshCw className="size-4 shrink-0" />
        <p className="min-w-0 flex-1 text-sm font-medium">A new version of the app is ready.</p>
        <button
          type="button"
          onClick={apply}
          className="shrink-0 rounded-full bg-accent-light px-4 py-1.5 text-xs font-bold text-primary transition-transform active:scale-95"
        >
          Update
        </button>
      </div>
    </div>
  );
}
