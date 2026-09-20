"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPublicApiUrl } from "@/lib/api/config";
import type { CodeDropOffer } from "@/lib/home/data";
import { normalizeCodeDrop } from "@/lib/home/normalize";

type LiveCodesStatus = {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastUpdate: Date | null;
};

type UseLiveCodesSSEOptions = {
  casinoFilter?: string;
  autoConnect?: boolean;
  /** Max codes retained in the live buffer. */
  maxCodes?: number;
};

function parseSseCodes(payload: unknown): CodeDropOffer[] {
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;

  if (record.type === "init" && Array.isArray(record.codes)) {
    const seen = new Set<string>();
    const out: CodeDropOffer[] = [];
    for (let i = 0; i < record.codes.length; i++) {
      const offer = normalizeCodeDrop(record.codes[i], i);
      if (!offer) continue;
      const key = `${offer.casinoSlug}:${offer.code.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(offer);
    }
    return out;
  }

  if (record.type === "new_code") {
    const offer = normalizeCodeDrop(record.code, 0);
    return offer ? [offer] : [];
  }

  return [];
}

/**
 * Port of reference `useLiveCodesSSE` → `EventSource ${API_URL}/api/codes/live`.
 */
export function useLiveCodesSSE(options: UseLiveCodesSSEOptions = {}) {
  const {
    casinoFilter = "",
    autoConnect = true,
    maxCodes = 20,
  } = options;

  const [codes, setCodes] = useState<CodeDropOffer[]>([]);
  const [status, setStatus] = useState<LiveCodesStatus>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastUpdate: null,
  });

  const sourceRef = useRef<EventSource | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryMsRef = useRef(3000);
  const aliveRef = useRef(true);

  const clearRetry = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    aliveRef.current = false;
    clearRetry();
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }
    setStatus((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
    }));
  }, [clearRetry]);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }
    clearRetry();
    aliveRef.current = true;

    setStatus((prev) => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    const url = new URL(`${getPublicApiUrl()}/api/codes/live`);
    if (casinoFilter.trim()) {
      url.searchParams.set("casino", casinoFilter.trim());
    }

    const source = new EventSource(url.toString());
    sourceRef.current = source;

    source.onopen = () => {
      retryMsRef.current = 3000;
      setStatus({
        isConnected: true,
        isConnecting: false,
        error: null,
        lastUpdate: new Date(),
      });
    };

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as unknown;
        const parsed = parseSseCodes(payload);

        if (
          payload &&
          typeof payload === "object" &&
          (payload as { type?: string }).type === "init"
        ) {
          setCodes(parsed.slice(0, maxCodes));
        } else if (parsed.length > 0) {
          setCodes((prev) => {
            const next = [...parsed];
            for (const existing of prev) {
              const key = `${existing.casinoSlug}:${existing.code.toLowerCase()}`;
              if (
                next.some(
                  (row) =>
                    `${row.casinoSlug}:${row.code.toLowerCase()}` === key,
                )
              ) {
                continue;
              }
              next.push(existing);
            }
            return next.slice(0, maxCodes);
          });
        }

        setStatus((prev) => ({ ...prev, lastUpdate: new Date() }));
      } catch (err) {
        console.error("[SSE] Failed to parse message:", err);
      }
    };

    source.onerror = () => {
      source.close();
      sourceRef.current = null;
      setStatus((prev) => ({
        ...prev,
        isConnected: false,
        isConnecting: false,
        error: "Connection error",
      }));

      if (!aliveRef.current) return;
      clearRetry();
      const delay = retryMsRef.current;
      retryMsRef.current = Math.min(delay * 2, 30_000);
      retryTimerRef.current = setTimeout(() => {
        if (aliveRef.current) connect();
      }, delay);
    };
  }, [casinoFilter, clearRetry, maxCodes]);

  useEffect(() => {
    if (!autoConnect) return;
    connect();
    return () => disconnect();
  }, [autoConnect, connect, disconnect]);

  return { codes, status, connect, disconnect };
}
