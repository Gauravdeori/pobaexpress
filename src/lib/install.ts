/**
 * Installing the app, in one place.
 *
 * Three surfaces offer it now — the header button, the strip across the top of
 * the landing page and the order section — and they were each growing their
 * own copy of the same `beforeinstallprompt` bookkeeping. The rules are subtle
 * enough (single-use event, no API at all on iOS, nothing to offer once
 * installed) that three copies is three chances to get them differently wrong.
 */

import { useCallback, useEffect, useState } from "react";

/** Chrome's install prompt event, which TypeScript's DOM lib doesn't define. */
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS reports installed apps here rather than through display-mode.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIosSafari() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

export type InstallOutcome = "accepted" | "dismissed" | "unavailable";

export type InstallPrompt = {
  /** Running inside the installed app already. Server render says false. */
  installed: boolean;
  /** iOS Safari, which installs from the Share menu and has no install API. */
  ios: boolean;
  /** A held `beforeinstallprompt` this browser will let us replay. */
  canPrompt: boolean;
  /**
   * Replays the held prompt. "unavailable" means the browser never offered
   * one — the caller should show instructions rather than nothing, since that
   * covers iOS Safari and any Chrome that withheld the event this visit.
   */
  promptInstall: () => Promise<InstallOutcome>;
};

export function useInstallPrompt(): InstallPrompt {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  // All three start at their server-render values: nothing here can be known
  // before the client runs, and guessing would mean a hydration mismatch.
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    setIos(isIosSafari());

    const onBeforeInstall = (event: Event) => {
      // Stop Chrome's own mini-infobar so our buttons are the entry point.
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setPromptEvent(null);
      setInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<InstallOutcome> => {
    if (!promptEvent) return "unavailable";
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    // The event is single-use, so drop it either way.
    setPromptEvent(null);
    return outcome;
  }, [promptEvent]);

  return { installed, ios, canPrompt: promptEvent !== null, promptInstall };
}
