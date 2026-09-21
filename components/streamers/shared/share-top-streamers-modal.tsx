"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, RefreshCw, Share2 } from "lucide-react";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Modal } from "@/components/ui/modal";
import { track } from "@/lib/analytics/track";
import { mvOf, parseMoney } from "@/lib/streamers/data";
import {
  SHARE_METRIC_OPTIONS,
  type ShareMetricId,
} from "@/lib/streamers/share-metrics";
import type { StreamerRecord } from "@/lib/streamers/types";
import {
  useDialogFocusTrap,
  useShareActions,
  useShareCapabilities,
  useSnapshotImages,
} from "@/lib/share/quick-share";

function metricValue(row: StreamerRecord, metric: ShareMetricId): number | null {
  switch (metric) {
    case "market-value":
      return mvOf(row);
    case "payment":
      return parseMoney(row.estMonthlyPayment);
    case "followers":
      return row.followers || null;
    case "avg-viewers":
      return row.avgViewers30d || null;
    case "view-hours":
      return row.hoursWatched30d || null;
    case "stream-hours":
      return row.streamHours30d || null;
    case "leaderboard":
      return row.monthlyLeaderboardUsd || null;
    default:
      return null;
  }
}

function buildOgUrl(
  metric: string,
  casino: string | null,
  streamers: string[],
  auto: boolean,
): string {
  let url = `/api/og/streamers?metric=${metric}`;
  if (casino) url += `&casino=${encodeURIComponent(casino)}`;
  for (const s of streamers) url += `&streamer=${encodeURIComponent(s)}`;
  if (auto && streamers.length) url += "&auto=1";
  return url;
}

type ShareTopStreamersModalProps = {
  streamers: StreamerRecord[];
  casinoOptions: string[];
  onClose: () => void;
};

export function ShareTopStreamersModal({
  streamers,
  casinoOptions,
  onClose,
}: ShareTopStreamersModalProps) {
  const [metric, setMetric] = useState<ShareMetricId>("market-value");
  const [casinos, setCasinos] = useState<Set<string> | null>(null);
  const [pickerState, setPickerState] = useState<{
    scope: string;
    set: Set<string>;
  } | null>(null);
  const { canCopyImage } = useShareCapabilities();
  const containerRef = useRef<HTMLDivElement>(null);

  const casinoKeys = useMemo(
    () => (casinos ? [...casinos].map((c) => c.toLowerCase()).sort() : []),
    [casinos],
  );
  const casinoFilterActive = casinos !== null;

  const rankedOptions = useMemo(() => {
    const allowed = new Set(casinoKeys);
    return streamers
      .filter(
        (row) =>
          !casinoFilterActive ||
          allowed.has((row.currentCasino ?? "").trim().toLowerCase()),
      )
      .map((row) => ({
        row,
        value: metricValue(row, metric),
      }))
      .filter((x) => x.value != null && x.value > 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
      .map(({ row }) => ({
        value: row.username.trim().toLowerCase(),
        label: row.username,
        avatar: row.avatarUrl ?? null,
      }));
  }, [streamers, casinoKeys, casinoFilterActive, metric]);

  const avatarBySlug = useMemo(
    () => new Map(rankedOptions.map((o) => [o.value, o.avatar])),
    [rankedOptions],
  );

  const defaultTop = useMemo(
    () => rankedOptions.slice(0, 10).map((o) => o.value),
    [rankedOptions],
  );

  const scopeKey = `${metric}|${casinoKeys.join(",")}`;
  const pickedSet = useMemo(
    () =>
      pickerState?.scope === scopeKey ? pickerState.set : new Set(defaultTop),
    [pickerState, scopeKey, defaultTop],
  );

  const setPickedSet = useCallback(
    (set: Set<string>) => setPickerState({ scope: scopeKey, set }),
    [scopeKey],
  );

  const defaultKey = [...defaultTop].sort().join(",");
  const { list: exportList, auto } = useMemo(() => {
    const valid = new Set(rankedOptions.map((o) => o.value));
    const sorted = [...pickedSet].filter((id) => valid.has(id)).sort();
    if (sorted.length === 0 || sorted.length > 10) {
      return { list: [...defaultTop].sort(), auto: true };
    }
    return { list: sorted, auto: sorted.join(",") === defaultKey };
  }, [pickedSet, rankedOptions, defaultTop, defaultKey]);

  const manualPicks = useMemo(
    () => (auto ? [] : exportList),
    [auto, exportList],
  );

  const singleCasino =
    casinoFilterActive && casinoKeys.length === 1 ? casinoKeys[0] : null;
  const atCap = pickedSet.size >= 10;

  const streamerDropdownOptions = rankedOptions.map((o) => ({
    value: o.value,
    label: o.label,
    ...(atCap && !pickedSet.has(o.value) ? { disabled: true } : {}),
  }));

  const cacheKey = [
    metric,
    singleCasino ?? "",
    (casinoFilterActive || !auto ? exportList : []).join(","),
    auto ? "1" : "0",
  ].join("|");

  const resolveUrl = useCallback((key: string) => {
    const [m, casino, streamerPart, autoFlag] = key.split("|");
    return buildOgUrl(
      m,
      casino || null,
      streamerPart ? streamerPart.split(",") : [],
      autoFlag === "1",
    );
  }, []);

  const trackProps = useCallback(
    (key: string) => ({
      content: "streamers-top",
      metric: key.split("|")[0],
      picked: key.split("|")[2] ? key.split("|")[2].split(",").length : 0,
    }),
    [],
  );

  const { images, imageFailed, fetchImage } = useSnapshotImages(
    resolveUrl,
    trackProps,
  );

  useEffect(() => {
    track("quick_share_preview_opened", { mode: "streamers-top" });
  }, []);

  useEffect(() => {
    fetchImage(cacheKey);
  }, [cacheKey, fetchImage]);

  useDialogFocusTrap(containerRef);

  const shareLink =
    typeof window !== "undefined" ? `${window.location.origin}/streamers` : "";

  const eventProps = useCallback(
    () => ({
      content: "streamers-top",
      metric,
      picked: manualPicks.length,
    }),
    [metric, manualPicks.length],
  );

  const fileName = useCallback(
    () =>
      `fairgambling-${
        manualPicks.length ? `${manualPicks.length}-streamers` : "top10-streamers"
      }-${metric}${casinoKeys.length ? `-${casinoKeys.join("-")}` : ""}.png`,
    [metric, casinoKeys, manualPicks.length],
  );

  const share = useShareActions({
    image: images[cacheKey],
    text: "",
    shareLink,
    fileName,
    nativeFileName: fileName,
    eventProps,
  });

  const preview = images[cacheKey];

  return (
    <Modal
      open
      onClose={onClose}
      title="Share"
      padded={false}
      theme="auto"
      className="max-w-[560px] p-4 md:p-5"
    >
      <div ref={containerRef} className="flex flex-col gap-3 md:gap-4">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 [&_[aria-haspopup=listbox]]:h-9">
            <Dropdown
              block
              theme="auto"
              options={SHARE_METRIC_OPTIONS}
              value={metric}
              onChange={(v) => {
                share.clearActionFeedback();
                setMetric(v as ShareMetricId);
              }}
            />
            <Dropdown
              multiple
              block
              searchable
              allPreviewIcons
              theme="auto"
              options={casinoOptions.map((c) => ({ value: c, label: c }))}
              value={casinos}
              onChange={(v) => {
                share.clearActionFeedback();
                setCasinos(v);
              }}
              allLabel="All Casinos"
              noun="Casino"
              renderIcon={(name, size) => (
                <AnalyticsCasinoIcon casinoName={name} size={size} theme="auto" />
              )}
            />
          </div>
          <div className="[&_[aria-haspopup=listbox]]:h-9">
            <Dropdown
              multiple
              block
              searchable
              theme="auto"
              options={streamerDropdownOptions}
              value={pickedSet}
              onChange={(v) => {
                share.clearActionFeedback();
                setPickedSet(v ?? new Set(defaultTop));
              }}
              placeholder="Streamers"
              noun="Streamer"
              renderIcon={(slug, size) => {
                const src = avatarBySlug.get(slug);
                if (!src) return null;
                return (
                  <img
                    src={src}
                    alt=""
                    width={size}
                    height={size}
                    className="rounded-full object-cover"
                    style={{ width: size, height: size }}
                  />
                );
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {preview ? (
            <img
              src={preview.url}
              alt="FairGambling streamers snapshot preview"
              className="mx-auto max-h-[min(420px,calc(85vh_-_280px))] w-auto max-w-full md:max-h-[min(460px,calc(85vh_-_280px))]"
            />
          ) : imageFailed[cacheKey] ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border-[0.5px] border-[#2a274e]/10 bg-[#2a274e]/[0.03] px-4 py-8 text-center md:py-10 dark:border-white/10 dark:bg-white/[0.02]">
              <span className="text-[13px] text-[#2a274e]/60 dark:text-white/60">
                Generating this image failed.
              </span>
              <Button
                size="sm"
                theme="auto"
                leftIcon={<RefreshCw />}
                onClick={() => fetchImage(cacheKey)}
              >
                Retry
              </Button>
            </div>
          ) : (
            <div
              className="h-[min(420px,calc(85vh_-_280px))] w-full animate-pulse rounded-2xl border-[0.5px] border-[#2a274e]/10 bg-[#2a274e]/[0.06] md:h-[min(460px,calc(85vh_-_280px))] dark:border-white/10 dark:bg-white/[0.04]"
              aria-label="Generating image"
            />
          )}
        </div>
        <div
          className={`grid grid-cols-1 gap-2 ${
            canCopyImage ? "sm:grid-cols-3" : "sm:grid-cols-2"
          } [&>button]:w-full [&>button]:justify-center`}
        >
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Share2 />}
            onClick={share.handleCopyLink}
            aria-label="Share (copies the page link)"
          >
            {share.copiedLink ? "Link copied!" : "Share"}
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Download />}
            onClick={share.handleDownload}
            disabled={!preview}
          >
            {share.saved ? "Saved!" : "Download image"}
          </Button>
          {canCopyImage ? (
            <Button
              size="sm"
              theme="auto"
              leftIcon={<Copy />}
              onClick={share.handleCopyImage}
              disabled={!preview}
            >
              {share.copiedImage ? "Copied!" : "Copy image"}
            </Button>
          ) : null}
        </div>
        {share.actionError ? (
          <span className="text-[12px] text-[#dc2626] dark:text-[#f05959]">
            {share.actionError}
          </span>
        ) : null}
      </div>
    </Modal>
  );
}
