"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { track } from "@/lib/analytics/track";

export async function fetchSnapshot(url: string, timeoutMs = 15_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const FOCUSABLE =
  'button:not([disabled]), [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';

export function useDialogFocusTrap(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const dialogRoot = () =>
      containerRef.current?.closest('[role="dialog"]') as HTMLElement | null;

    const raf = requestAnimationFrame(() => {
      dialogRoot()?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const root = dialogRoot();
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (active && root.contains(active)) {
        if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }
      event.preventDefault();
      first.focus();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [containerRef]);
}

export function useShareCapabilities() {
  const [canCopyImage] = useState(
    () =>
      typeof navigator !== "undefined" &&
      typeof ClipboardItem !== "undefined" &&
      !!navigator.clipboard &&
      typeof navigator.clipboard.write === "function",
  );

  const [canNativeShare] = useState(() => {
    if (typeof navigator === "undefined" || typeof navigator.canShare !== "function") {
      return false;
    }
    try {
      const probe = new File([new Uint8Array([137, 80, 78, 71])], "probe.png", {
        type: "image/png",
      });
      return navigator.canShare({ files: [probe] });
    } catch {
      return false;
    }
  });

  return { canCopyImage, canNativeShare };
}

type SnapshotImage = { blob: Blob; url: string };

export function useSnapshotImages(
  buildUrl: (key: string) => string,
  eventProps: (key: string) => Record<string, unknown>,
) {
  const [images, setImages] = useState<Record<string, SnapshotImage>>({});
  const [imageFailed, setImageFailed] = useState<Record<string, boolean>>({});
  const inflight = useRef(new Set<string>());
  const retried = useRef(new Set<string>());
  const retryTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const objectUrls = useRef<string[]>([]);
  const mounted = useRef(true);

  const fetchImage = useCallback(
    (key: string) => {
      if (inflight.current.has(key)) return;
      inflight.current.add(key);

      const finish = () => {
        inflight.current.delete(key);
      };

      const attempt = (tryNo: number) => {
        const started = performance.now();
        track("quick_share_image_requested", {
          ...eventProps(key),
          format: "png",
          attempt: tryNo,
        });

        fetchSnapshot(buildUrl(key))
          .then(async (response) => {
            if (!response.ok) {
              throw Object.assign(new Error("bad status"), {
                status: response.status,
              });
            }
            const blob = await response.blob();
            if (!mounted.current) return;
            const url = URL.createObjectURL(blob);
            objectUrls.current.push(url);
            setImages((prev) => ({ ...prev, [key]: { blob, url } }));
            setImageFailed((prev) => ({ ...prev, [key]: false }));
            track("quick_share_image_success", {
              ...eventProps(key),
              duration_ms: Math.round(performance.now() - started),
              bytes: blob.size,
              attempt: tryNo,
            });
          })
          .then(finish, (error: { status?: number }) => {
            track("quick_share_image_failed", {
              ...eventProps(key),
              status_code: error?.status ?? 0,
              attempt: tryNo,
            });
            if (mounted.current && !retried.current.has(key)) {
              retried.current.add(key);
              retryTimers.current.set(
                key,
                setTimeout(() => {
                  retryTimers.current.delete(key);
                  if (mounted.current) attempt(tryNo + 1);
                  else finish();
                }, 2_000),
              );
              return;
            }
            setImageFailed((prev) => ({ ...prev, [key]: true }));
            finish();
          });
      };

      attempt(1);
    },
    [buildUrl, eventProps],
  );

  useEffect(() => {
    mounted.current = true;
    const timers = retryTimers.current;
    const urls = objectUrls.current;
    return () => {
      mounted.current = false;
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.length = 0;
    };
  }, []);

  return { images, imageFailed, fetchImage, mounted };
}

type ShareActionsOptions = {
  image: SnapshotImage | undefined;
  text: string;
  shareLink: string;
  fileName: () => string;
  nativeFileName?: () => string;
  eventProps: () => Record<string, unknown>;
};

export function useShareActions({
  image,
  text,
  shareLink,
  fileName,
  nativeFileName,
  eventProps,
}: ShareActionsOptions) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [saved, setSaved] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const flash = (setter: (value: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 2_000);
  };

  const clearActionFeedback = useCallback(() => {
    setPopupBlocked(false);
    setActionError(null);
  }, []);

  const handleCopyLink = useCallback(async () => {
    track("quick_share_action_clicked", { action: "copy_link", ...eventProps() });
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    flash(setCopiedLink);
    track("quick_share_action_succeeded", { action: "copy_link", ...eventProps() });
  }, [eventProps, shareLink]);

  const handleDownload = useCallback(() => {
    if (!image) return;
    track("quick_share_action_clicked", { action: "download", ...eventProps() });
    const anchor = document.createElement("a");
    anchor.download = fileName();
    anchor.href = image.url;
    anchor.click();
    flash(setSaved);
    track("quick_share_action_succeeded", {
      action: "download",
      ...eventProps(),
      bytes: image.blob.size,
    });
  }, [eventProps, fileName, image]);

  const handleCopyImage = useCallback(async () => {
    if (!image) return;
    track("quick_share_action_clicked", { action: "copy_image", ...eventProps() });
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": image.blob }),
      ]);
      flash(setCopiedImage);
      track("quick_share_action_succeeded", {
        action: "copy_image",
        ...eventProps(),
      });
    } catch {
      setActionError(
        "Copying the image failed in this browser. Try Download instead.",
      );
      track("quick_share_action_failed", {
        action: "copy_image",
        ...eventProps(),
        error_code: "write_rejected",
      });
    }
  }, [eventProps, image]);

  const handleNativeShare = useCallback(async () => {
    if (!image) return;
    track("quick_share_action_clicked", { action: "native_share", ...eventProps() });
    const file = new File([image.blob], (nativeFileName ?? fileName)(), {
      type: "image/png",
    });
    try {
      await navigator.share({ files: [file], text, url: shareLink });
      track("quick_share_action_succeeded", {
        action: "native_share",
        ...eventProps(),
      });
    } catch (error) {
      if ((error as { name?: string })?.name === "AbortError") return;
      setActionError(
        "Sharing failed in this browser. Try Download instead.",
      );
      track("quick_share_action_failed", {
        action: "native_share",
        ...eventProps(),
        error_code: "share_rejected",
      });
    }
  }, [eventProps, fileName, image, nativeFileName, shareLink, text]);

  const openShareWindow = useCallback(
    (action: string, url: string) => {
      track("quick_share_action_clicked", { action, ...eventProps() });
      if (!window.open(url, "_blank", "noopener,noreferrer")) {
        setPopupBlocked(true);
        track("quick_share_action_failed", {
          action,
          ...eventProps(),
          error_code: "popup_blocked",
        });
        return;
      }
      track("quick_share_action_succeeded", { action, ...eventProps() });
    },
    [eventProps],
  );

  const handleShareX = useCallback(() => {
    openShareWindow(
      "x_intent",
      `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}`,
    );
  }, [openShareWindow, shareLink, text]);

  const handleShareTelegram = useCallback(() => {
    openShareWindow(
      "telegram_intent",
      `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(text)}`,
    );
  }, [openShareWindow, shareLink, text]);

  return {
    copiedLink,
    copiedImage,
    saved,
    popupBlocked,
    actionError,
    clearActionFeedback,
    handleCopyLink,
    handleDownload,
    handleCopyImage,
    handleNativeShare,
    handleShareX,
    handleShareTelegram,
  };
}
