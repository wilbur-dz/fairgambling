import type { ComplaintBucketCounts, ComplaintsGlobalStats } from "@/lib/complaints/types";

/** Design tokens from reference `ND_COLORS` (286043). */
export const ND_COLORS = {
  accent: "#8874ff",
  accentDeep: "#5105a1",
} as const;

export type ResolutionWorkflowIconKey =
  | "file-up"
  | "clipboard-check"
  | "message-square-reply"
  | "handshake"
  | "megaphone";

export type ResolutionWorkflowStep = {
  icon: ResolutionWorkflowIconKey;
  title: string;
  description: string;
  /** Optional live metric line from API (counts / global stats). */
  liveStat?: string | null;
};

export type ResolutionHowItWorksContent = {
  heading: string;
  judgeHref: string;
  judgeLabel: string;
  steps: ResolutionWorkflowStep[];
};

/** Static copy from reference `HowItWorks` (114224). */
export const DEFAULT_RESOLUTION_HOW_IT_WORKS: ResolutionHowItWorksContent = {
  heading: "How resolution works",
  judgeHref: "/complaints/rules",
  judgeLabel: "How we judge",
  steps: [
    {
      icon: "file-up",
      title: "You file",
      description: "Submit your case with evidence",
    },
    {
      icon: "clipboard-check",
      title: "We review",
      description: "A resolver checks it and approves",
    },
    {
      icon: "message-square-reply",
      title: "Casino responds",
      description: "The casino replies",
    },
    {
      icon: "handshake",
      title: "Mediation",
      description: "Both sides work toward a settlement",
    },
    {
      icon: "megaphone",
      title: "Outcome",
      description: "The outcome is published",
    },
  ],
};

const ICON_KEYS = new Set<string>([
  "file-up",
  "clipboard-check",
  "message-square-reply",
  "handshake",
  "megaphone",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const s = value.trim();
  return s || null;
}

function normalizeRemoteStep(raw: unknown): ResolutionWorkflowStep | null {
  if (!isRecord(raw)) return null;
  const title = asString(raw.title);
  const description =
    asString(raw.description) ?? asString(raw.desc) ?? asString(raw.subtitle);
  const iconRaw = asString(raw.icon)?.toLowerCase();
  if (!title || !description || !iconRaw || !ICON_KEYS.has(iconRaw)) {
    return null;
  }
  return {
    icon: iconRaw as ResolutionWorkflowIconKey,
    title,
    description,
  };
}

/** Accepts `{ data: { steps: [...] } }` or `{ steps: [...] }` when API adds CMS workflow. */
export function normalizeResolutionWorkflowPayload(
  payload: unknown,
): ResolutionWorkflowStep[] {
  const root = isRecord(payload) && "data" in payload ? payload.data : payload;
  if (!isRecord(root)) return [];
  const rows = root.steps ?? root.workflow ?? root.items;
  if (!Array.isArray(rows)) return [];
  return rows
    .map(normalizeRemoteStep)
    .filter((step): step is ResolutionWorkflowStep => step != null);
}

export function enrichResolutionStepsWithStats(
  steps: ResolutionWorkflowStep[],
  counts: ComplaintBucketCounts | null,
  global: ComplaintsGlobalStats | null,
): ResolutionWorkflowStep[] {
  if (!counts && !global) return steps;

  return steps.map((step, index) => {
    let liveStat: string | null = null;
    if (counts) {
      switch (index) {
        case 0:
          liveStat = `${counts.all.toLocaleString("en-US")} cases on record`;
          break;
        case 1:
          liveStat = `${counts.active.toLocaleString("en-US")} active in queue`;
          break;
        case 2:
          liveStat = `${counts.active.toLocaleString("en-US")} awaiting responses`;
          break;
        case 4:
          liveStat = `${counts.resolved.toLocaleString("en-US")} resolved · ${counts.dismissed.toLocaleString("en-US")} rejected`;
          break;
        default:
          break;
      }
    } else if (global && index === 0) {
      liveStat = `${global.totalDisputes.toLocaleString("en-US")} total disputes`;
    }
    return liveStat ? { ...step, liveStat } : step;
  });
}
