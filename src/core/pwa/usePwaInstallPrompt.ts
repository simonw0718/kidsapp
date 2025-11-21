// src/core/pwa/usePwaInstallPrompt.ts
import { useCallback, useEffect, useState } from "react";

// 瀏覽器的 beforeinstallprompt 事件型別（自己定一個簡單版）
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator as any).standalone === true
    );
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // 阻止瀏覽器預設的迷你 bar，改成由我們自己觸發
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return { outcome: "dismissed" as const };

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    // 無論接受或拒絕，都把事件清掉，避免重複出現
    setDeferredPrompt(null);
    return choice;
  }, [deferredPrompt]);

  const isInstallable = !!deferredPrompt && !isInstalled;

  return {
    isInstallable,
    isInstalled,
    promptInstall,
  };
}