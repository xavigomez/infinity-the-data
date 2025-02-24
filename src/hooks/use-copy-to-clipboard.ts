import { useCallback } from "react";

export function useCopyToClipboard() {
  const isSupported = navigator?.clipboard;
  const copy = useCallback(
    async (text: string) => {
      if (!isSupported) {
        // TODO: Handle clipboard not supported
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        // TODO: handle error
        console.warn("Copy failed", error);
        return false;
      }
    },
    [isSupported],
  );

  return { copyToClipboard: copy, isClipboardSupported: isSupported };
}
