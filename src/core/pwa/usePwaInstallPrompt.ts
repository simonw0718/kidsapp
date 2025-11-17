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
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 先檢查是不是已經以 PWA 模式安裝
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS Safari 專用
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

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