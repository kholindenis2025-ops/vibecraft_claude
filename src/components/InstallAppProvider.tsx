"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallAppContextValue = {
  canInstall: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  promptInstall: () => Promise<void>;
};

const InstallAppContext = createContext<InstallAppContextValue>({
  canInstall: false,
  isInstalled: false,
  isIOS: false,
  promptInstall: async () => {},
});

export function useInstallApp() {
  return useContext(InstallAppContext);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari's own flag for "launched from home screen"
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallAppProvider({ children }: { children: ReactNode }) {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsInstalled(isStandalone());
    setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent) && !isStandalone());

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredEvent(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setDeferredEvent(null);
      setIsInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    await deferredEvent.userChoice;
    setDeferredEvent(null);
  }

  return (
    <InstallAppContext.Provider
      value={{ canInstall: Boolean(deferredEvent), isInstalled, isIOS, promptInstall }}
    >
      {children}
    </InstallAppContext.Provider>
  );
}
