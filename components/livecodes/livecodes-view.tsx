"use client";

import { useState } from "react";
import { CodesFeedCard } from "@/components/livecodes/codes-feed-card";
import { LiveCodesStats } from "@/components/livecodes/livecodes-stats";
import { LiveCodesToolbar } from "@/components/livecodes/livecodes-toolbar";
import { SupportedCasinos } from "@/components/livecodes/supported-casinos";
import type {
  CodeCasino,
  CodesStatsPayload,
  LiveCode,
} from "@/lib/livecodes/data";

export type LiveCodesViewProps = {
  codes: LiveCode[];
  stats: CodesStatsPayload | null;
  casinos: CodeCasino[];
};

/**
 * Port of reference `LiveCodesView` — main content only.
 * Table: `GET /api/codes`. Stats: `GET /api/codes/stats`.
 * Casino filter: catalog from `/api/casinos`, filtered by stats + codes.
 */
export function LiveCodesView({ codes, stats, casinos }: LiveCodesViewProps) {
  const [search, setSearch] = useState("");

  return (
    <main className="flex flex-col gap-6 px-4 pb-6 pt-6 md:px-6">
      <LiveCodesToolbar search={search} onSearchChange={setSearch} />
      <CodesFeedCard
        codes={codes}
        casinos={casinos}
        stats={stats}
        search={search}
        live
      />
      <SupportedCasinos />
      <LiveCodesStats stats={stats} />
    </main>
  );
}
