export type PublicComplaint = {
  id: string;
  casinoName?: string | null;
  casinoSlug?: string | null;
  casinoLogoUrl?: string | null;
  category?: string | null;
  title?: string | null;
  status?: string | null;
  disputedAmount?: number | string | null;
  disputedCurrency?: string | null;
  submittedAt?: string | null;
  updatedAt?: string | null;
  casinoDeadlineAt?: string | null;
  userReplyDeadlineAt?: string | null;
  receiptDeadlineAt?: string | null;
};

export type ComplaintBucketCounts = {
  all: number;
  active: number;
  unresolved: number;
  resolved: number;
  dismissed: number;
};

export type CasinoComplaintBreakdownRow = {
  casinoId: number;
  name: string;
  slug: string;
  logoUrl?: string | null;
  total: number;
  open: number;
  resolved: number;
  unresolved: number;
  rejected: number | null;
};

export type CategoryComplaintBreakdownRow = {
  category: string;
  total: number;
  open: number;
  resolved: number;
  unresolved: number;
  rejected: number | null;
};

export type ComplaintsGlobalStats = {
  totalDisputes: number;
  resolved: number;
  fundsRecoveredUsd: number;
  avgResolutionHours: number | null;
};

export type CasinoComplaintStats = {
  totalDisputes: number;
  resolved: number;
  open: number;
  avgResponseHours: number | null;
  fundsRecoveredUsd: number;
};

export type PublicComplaintsList = {
  rows: PublicComplaint[];
  total: number;
  counts?: ComplaintBucketCounts | null;
};

export type CasinoComplaintBreakdown = {
  rows: CasinoComplaintBreakdownRow[];
};

export type CategoryComplaintBreakdown = {
  rows: CategoryComplaintBreakdownRow[];
};

export type ComplaintStatusEvent = {
  id: number;
  fromStatus: string | null;
  toStatus: string;
  actorType: string;
  reason: string | null;
  createdAt: string;
};

export type ComplaintDetailRecord = PublicComplaint & {
  description?: string | null;
  caseSummary?: string | null;
  displayHandle?: string | null;
  verdict?: string | null;
  verdictReasoning?: string | null;
  verdictPublishedAt?: string | null;
  privacyMode?: string | null;
  incidentDate?: string | null;
  settledAmount?: number | string | null;
  settledAt?: string | null;
  closedAt?: string | null;
};

export type ComplaintDetailCasino = {
  id: number;
  slug: string;
  name: string;
  logoUrl?: string | null;
};

export type PublicComplaintDetail = {
  complaint: ComplaintDetailRecord;
  casino: ComplaintDetailCasino | null;
  messages: unknown[];
  statusEvents: ComplaintStatusEvent[];
  evidence: unknown[];
  isOwner: boolean;
};
