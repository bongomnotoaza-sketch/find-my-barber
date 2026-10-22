// src/lib/usePwaInstall.ts
import { useCallback, useEffect, useRef, useState } from "react";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const LS_KEY = "fmb_pwa_installed";

function readInstalledFlag(): boolean {
  try {
    return localStorage.getItem(LS_KEY) === "1";
  } catch {
    return false;
  }
}

function writeInstalledFlag() {
  try {
    localStorage.setItem(LS_KEY, "1");
  } catch {
    /* private mode / quota — ignore */
  }
}

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mql = window.matchMedia?.("(display-mode: standalone)");
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
    true;
  return !!mql?.matches || iosStandalone;
}

/**
 * Synchronous "is this running as / known to be installed PWA" check.
 * Safe to call in a useState initializer so returning PWA users never see
 * a flash of the landing page.
 */
export function detectStandaloneSync(): boolean {
  if (typeof window === "undefined") return false;
  if (readInstalledFlag()) return true;
  return detectStandalone();
}

export function usePwaInstall() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isInstalled, setIsInstalled] = useState<boolean>(() =>
    detectStandaloneSync(),
  );

  const isIOS = useRef(
    typeof navigator !== "undefined" &&
      /iPhone|iPad|iPod/i.test(navigator.userAgent),
  ).current;

  useEffect(() => {
    if (detectStandalone()) {
      writeInstalledFlag();
      setIsInstalled(true);
    }

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      writeInstalledFlag();
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    const mql = window.matchMedia?.("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) handleInstalled();
    };
    mql?.addEventListener?.("change", handleDisplayModeChange);

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
      mql?.removeEventListener?.("change", handleDisplayModeChange);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<
    "accepted" | "dismissed" | "unavailable"
  > => {
    if (!installPrompt) return "unavailable";
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstallPrompt(null);
    }
    return choice.outcome;
  }, [installPrompt]);

  return { isInstalled, installPrompt, isIOS, promptInstall };
}