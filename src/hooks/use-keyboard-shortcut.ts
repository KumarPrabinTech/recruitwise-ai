import { useEffect } from "react";

interface UseKeyboardShortcutOptions {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  callback: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcut({
  key,
  ctrlKey = false,
  metaKey = false,
  callback,
  enabled = true,
}: UseKeyboardShortcutOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const matchCtrl = ctrlKey ? e.ctrlKey || e.metaKey : true;
      const matchMeta = metaKey ? e.metaKey : true;

      if (e.key === key && matchCtrl && matchMeta) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, ctrlKey, metaKey, callback, enabled]);
}
