"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import {
  FieldLabel,
  NumberStepper,
} from "@/components/bonus-calculator/field";
import { Card } from "@/components/ui/card";
import { CasinoLogo } from "@/components/ui/casino-logo";
import { Dropdown } from "@/components/ui/dropdown";
import { Tabs } from "@/components/ui/tabs";
import { fetchVipLevelsClient } from "@/lib/bonus-calculator/api";
import { formatRequirement, formatUsdCompact } from "@/lib/bonus-calculator/calc";
import {
  GAME_TYPE_TABS,
  LEVEL_UP_ENABLED_SLUGS,
  type GameType,
} from "@/lib/bonus-calculator/data";
import {
  currentRankIndex,
  effectiveXp,
  groupLabel,
  groupRanks,
  levelUpBonusRows,
  STATIC_VIP_CASINOS,
  type VipCasinoMap,
} from "@/lib/bonus-calculator/vip";

function StatusDot({ status }: { status: "achieved" | "target" | "future" }) {
  if (status === "achieved") {
    return (
      <span className="flex size-[14px] shrink-0 items-center justify-center rounded-full bg-[#1f9d57] dark:bg-[#00ff86]">
        <Check size={9} strokeWidth={3.5} className="text-white" />
      </span>
    );
  }
  return (
    <span
      className={`size-[14px] shrink-0 rounded-full ${
        status === "target"
          ? "bg-[#8874ff]"
          : "bg-[rgba(42,39,78,0.1)] dark:bg-white/10"
      }`}
    />
  );
}

function TimelineGroup({
  group,
}: {
  group: ReturnType<typeof groupRanks>[number];
}) {
  return (
    <div className="relative z-10 flex flex-1 flex-col items-center gap-2 px-1 text-center">
      <span className="size-6 rounded-full border-[0.5px] border-[rgba(42,39,78,0.2)] bg-[rgba(142,142,255,0.4)] backdrop-blur-[35.5px] dark:border-white/20" />
      <span className="text-[16px] font-medium text-[#2a274e] dark:text-white">
        {groupLabel(group)}
      </span>
      <span className="text-[12px] leading-snug text-[rgba(42,39,78,0.5)] dark:text-white/50">
        {group.ranks
          .map((r) =>
            r.requirement == null ? "—" : formatRequirement(r.requirement),
          )
          .join(" / ")}
      </span>
    </div>
  );
}

/** Level Up Calculator — VIP ranks from API with static fallback. */
export function LevelUpCalculatorPanel() {
  const [data, setData] = useState<VipCasinoMap>(STATIC_VIP_CASINOS);
  const [casino, setCasino] = useState("stake");
  const [gameType, setGameType] = useState<GameType>("slots");
  const [wager, setWager] = useState("");
  const [target, setTarget] = useState("Silver");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await fetchVipLevelsClient();
        if (!cancelled) setData(next);
      } catch (err) {
        console.warn(
          "[bonus-calculator] vip-levels fallback to static",
          err instanceof Error ? err.message : String(err),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getCasino = useCallback((slug: string) => data[slug], [data]);
  const casinoKeys = useMemo(() => Object.keys(data), [data]);

  const selected = getCasino(casino) ?? getCasino("stake");
  const ranks = useMemo(
    () => (selected?.ranks ?? []).filter((r) => r.requirement != null),
    [selected],
  );

  const casinoOptions = useMemo(
    () =>
      casinoKeys.map((slug) => ({
        value: slug,
        label: data[slug].name,
        disabled: !LEVEL_UP_ENABLED_SLUGS.has(slug),
      })),
    [casinoKeys, data],
  );

  const levelOptions = useMemo(
    () => ranks.map((r) => ({ value: r.name, label: r.name })),
    [ranks],
  );

  const xp = effectiveXp(parseFloat(wager) || 0, gameType);
  const currentIdx = currentRankIndex(ranks, xp);
  const targetIdx = ranks.findIndex((r) => r.name === target);
  const targetReq = ranks[targetIdx]?.requirement ?? 0;
  const progress =
    targetReq > 0
      ? Math.min(100, Math.max(0, (xp / targetReq) * 100))
      : 0;
  const left = Math.max(0, targetReq - xp);
  const { rows, totalToEarn } = levelUpBonusRows(
    ranks,
    currentIdx >= 0 ? currentIdx : 0,
    targetIdx,
  );
  const groups = groupRanks(ranks);

  const onCasinoChange = (slug: string) => {
    setCasino(slug);
    const nextRanks = (getCasino(slug)?.ranks ?? []).filter(
      (r) => r.requirement != null,
    );
    setTarget(nextRanks[1]?.name ?? nextRanks[0]?.name ?? "");
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <Card
          variant="glass"
          contentClassName="flex flex-col gap-5 md:gap-6"
        >
          <FieldLabel label="Select Casino">
            <Dropdown
              theme="auto"
              block
              size="md"
              sizeConfig={{ radius: 22, paddingY: 9.5, iconSize: 16 }}
              options={casinoOptions}
              value={casino}
              onChange={onCasinoChange}
              searchable
              renderIcon={(slug, size) => (
                <CasinoLogo
                  slug={slug}
                  name={data[slug]?.name ?? slug}
                  size={size}
                  analyticsStakeS
                />
              )}
            />
          </FieldLabel>

          <FieldLabel label="Game Type" labelSize={12}>
            <Tabs
              theme="auto"
              tabs={[...GAME_TYPE_TABS]}
              activeId={gameType}
              onChange={(id) => setGameType(id as GameType)}
              fill
              liquid={false}
              sizeConfig={{ paddingY: 8 }}
              className="w-full"
            />
          </FieldLabel>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldLabel label="Your Wager (USD)">
              <NumberStepper
                value={wager}
                onChange={setWager}
                ariaLabel="Your wager"
                placeholder="Enter total wager amount"
                step={100}
              />
            </FieldLabel>
            <FieldLabel label="Target VIP Level">
              <Dropdown
                theme="auto"
                block
                size="md"
                sizeConfig={{ radius: 22, paddingY: 9.5, iconSize: 16 }}
                options={levelOptions}
                value={target}
                onChange={setTarget}
                placeholder="Select level"
              />
            </FieldLabel>
          </div>

          <div className="flex items-center gap-2 rounded-[22px] border border-[rgba(42,39,78,0.1)] bg-white/[0.5] px-4 py-[18px] dark:border-white/10 dark:bg-white/[0.02]">
            <span className="shrink-0 text-[14px] text-[#2a274e] dark:text-white">
              {target || "—"}
            </span>
            <span className="h-[6px] min-w-0 flex-1 overflow-hidden rounded-full bg-[rgba(42,39,78,0.12)] dark:bg-[#344051]">
              <span
                className="block h-full rounded-full bg-[#9a80f9] transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </span>
            <span className="shrink-0 text-[14px] text-[#2a274e] dark:text-white">
              {Math.round(progress)}%
            </span>
            <span className="h-4 w-px shrink-0 bg-[rgba(42,39,78,0.5)] dark:bg-white/50" />
            <span className="shrink-0 text-[14px] text-[#2a274e] dark:text-white">
              {formatUsdCompact(left)}
            </span>
            <span className="shrink-0 text-[12px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
              Left
            </span>
          </div>
        </Card>

        <Card
          variant="glass"
          contentClassName="flex flex-col gap-5 md:gap-6"
        >
          <span className="text-[14px] font-medium text-[#2a274e] dark:text-white">
            Level-Up Bonuses
          </span>
          {rows.length > 0 ? (
            <>
              <div className="flex flex-col gap-3 md:gap-4">
                {rows.map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <StatusDot status={row.status} />
                      <span className="text-[14px] font-medium leading-none text-[rgba(42,39,78,0.55)] dark:text-[#97a1af]">
                        {row.name}
                      </span>
                    </div>
                    <span
                      className={`text-[14px] font-semibold leading-none ${
                        row.status === "target"
                          ? "text-[#1f9d57] dark:text-[#00ff86]"
                          : "text-[rgba(42,39,78,0.55)] dark:text-[#97a1af]"
                      }`}
                    >
                      {formatUsdCompact(row.bonus)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-px w-full bg-[rgba(42,39,78,0.1)] dark:bg-white/10" />
              <div className="flex items-center justify-between text-[14px] font-semibold">
                <span className="text-[#2a274e] dark:text-white">
                  Total to earn
                </span>
                <span className="text-[#1f9d57] dark:text-[#00ff86]">
                  {formatUsdCompact(totalToEarn)}
                </span>
              </div>
            </>
          ) : (
            <p className="text-[13px] leading-relaxed text-[rgba(42,39,78,0.5)] dark:text-white/50">
              Level-up bonus data isn&apos;t available for this casino yet.
            </p>
          )}
        </Card>
      </div>

      <Card variant="glass" padded={false} className="px-4 py-4 md:px-6">
        <ol className="flex flex-col md:hidden">
          {groups.map((group, index) => {
            const last = index === groups.length - 1;
            return (
              <li key={`${group.baseName}-v-${index}`} className="flex gap-3">
                <div className="flex flex-col items-center self-stretch">
                  <span className="mt-1 size-5 shrink-0 rounded-full border-[0.5px] border-[rgba(42,39,78,0.2)] bg-[rgba(142,142,255,0.4)] backdrop-blur-[35.5px] dark:border-white/20" />
                  {!last ? (
                    <span
                      aria-hidden
                      className="my-1 w-[2px] flex-1 rounded-full"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(136,116,255,0.55), rgba(136,116,255,0.12))",
                      }}
                    />
                  ) : null}
                </div>
                <div
                  className={`flex min-w-0 flex-1 items-baseline justify-between gap-4 ${last ? "" : "pb-5"}`}
                >
                  <span className="min-w-0 text-[15px] font-medium text-[#2a274e] dark:text-white">
                    {groupLabel(group)}
                  </span>
                  <span className="min-w-0 text-right text-[12px] leading-snug text-[rgba(42,39,78,0.5)] dark:text-white/50">
                    {group.ranks
                      .map((r) =>
                        r.requirement == null
                          ? "—"
                          : formatRequirement(r.requirement),
                      )
                      .join(" / ")}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="hidden md:block">
          <div className="scrollbar-hide overflow-x-auto">
            <div className="relative flex min-w-[680px] items-start justify-between">
              <span
                aria-hidden
                className="absolute top-[11px] h-1 rounded-full"
                style={{
                  left: `${50 / Math.max(1, groups.length)}%`,
                  right: `${50 / Math.max(1, groups.length)}%`,
                  background:
                    "linear-gradient(to right, rgba(136,116,255,0.1), rgba(136,116,255,0.55), rgba(136,116,255,0.1))",
                }}
              />
              {groups.map((group, index) => (
                <TimelineGroup
                  key={`${group.baseName}-${index}`}
                  group={group}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
