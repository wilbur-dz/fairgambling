"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Card } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
import {
  COMPLAINT_FIELD_LIMITS,
  ComplaintDuplicateError,
  createComplaintDraftClient,
  getCasinoBreakdownClient,
  getComplaintClient,
  submitComplaintClient,
  updateComplaintDraftClient,
} from "@/lib/complaints/api";
import { COMPLAINT_CATEGORY_OPTIONS } from "@/lib/complaints/display";
import type { CasinoComplaintBreakdownRow } from "@/lib/complaints/types";

const FORM_CATEGORIES = COMPLAINT_CATEGORY_OPTIONS.filter(
  (opt) => opt.value !== "",
);

const ink = "text-[#2a274e] dark:text-white";
const muted = "text-[rgba(42,39,78,0.65)] dark:text-white/60";

type Step = 1 | 2 | 3;

function validateDetails(input: {
  title: string;
  description: string;
}): string | null {
  const title = input.title.trim();
  const description = input.description.trim();
  if (title.length < COMPLAINT_FIELD_LIMITS.titleMin) {
    return `Title must be at least ${COMPLAINT_FIELD_LIMITS.titleMin} characters.`;
  }
  if (title.length > COMPLAINT_FIELD_LIMITS.titleMax) {
    return `Title must be at most ${COMPLAINT_FIELD_LIMITS.titleMax} characters.`;
  }
  if (description.length < COMPLAINT_FIELD_LIMITS.descriptionMin) {
    return "Please describe what happened.";
  }
  if (description.length > COMPLAINT_FIELD_LIMITS.descriptionMax) {
    return `Description is too long (max ${COMPLAINT_FIELD_LIMITS.descriptionMax}).`;
  }
  return null;
}

export function ComplaintNewWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftParam = searchParams.get("draft");
  const { accessToken } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [casinos, setCasinos] = useState<CasinoComplaintBreakdownRow[]>([]);
  const [casinoId, setCasinoId] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [complaintId, setComplaintId] = useState<string | null>(draftParam);
  const [loading, setLoading] = useState(Boolean(draftParam));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCasinoBreakdownClient()
      .then((data) => {
        if (!cancelled) setCasinos(data.rows.filter((row) => row.total >= 0));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!complaintId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const row = await getComplaintClient(complaintId, accessToken);
        if (cancelled) return;
        if (!row) {
          setError("Draft not found or expired.");
          return;
        }
        if (row.category) setCategory(row.category);
        if (row.title) setTitle(row.title);
        if (row.description) setDescription(row.description);
        if (row.disputedAmount != null) setAmount(String(row.disputedAmount));
        if (row.disputedCurrency) setCurrency(row.disputedCurrency);
        if (row.status !== "draft") {
          router.replace(`/complaints/${complaintId}`);
          return;
        }
        setStep(2);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load draft.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, complaintId, router]);

  useEffect(() => {
    if (!complaintId || casinos.length === 0) return;
    void getComplaintClient(complaintId, accessToken).then((row) => {
      if (!row?.casinoSlug) return;
      const match = casinos.find((c) => c.slug === row.casinoSlug);
      if (match) setCasinoId(String(match.casinoId));
    });
  }, [accessToken, casinos, complaintId]);

  const casinoOptions = useMemo(
    () =>
      casinos.map((row) => ({
        value: String(row.casinoId),
        label: row.name,
      })),
    [casinos],
  );

  async function ensureDraft(): Promise<string> {
    if (complaintId) return complaintId;
    if (!casinoId || !category) {
      throw new Error("Select a casino and category.");
    }
    const validation = validateDetails({ title, description });
    if (validation) throw new Error(validation);

    const created = await createComplaintDraftClient(
      {
        casinoId: Number(casinoId),
        category,
        title: title.trim(),
        description: description.trim(),
        disputedAmount: amount.trim() || null,
        disputedCurrency: amount.trim() ? currency : null,
      },
      accessToken,
    );
    setComplaintId(created.id);
    return created.id;
  }

  async function saveDraftPatch(): Promise<string | null> {
    const validation = validateDetails({ title, description });
    if (validation) {
      setError(validation);
      return null;
    }
    if (!casinoId || !category) {
      setError("Select a casino and category.");
      return null;
    }
    setBusy(true);
    setError(null);
    try {
      const id = await ensureDraft();
      await updateComplaintDraftClient(
        id,
        {
          casinoId: Number(casinoId),
          category,
          title: title.trim(),
          description: description.trim(),
          disputedAmount: amount.trim() || null,
          disputedCurrency: amount.trim() ? currency : null,
        },
        accessToken,
      );
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save draft.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit() {
    const id = await saveDraftPatch();
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      await submitComplaintClient(id, accessToken, {});
      router.push(`/complaints/${id}`);
    } catch (err) {
      if (err instanceof ComplaintDuplicateError) {
        setError(
          `${err.message} View case #DC-${String(err.existingComplaintId).padStart(4, "0")}.`,
        );
      } else {
        setError(err instanceof Error ? err.message : "Submit failed.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="px-4 py-8 md:px-6">
        <p className={`text-sm ${muted}`}>Loading draft…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4 px-4 pb-8 pt-6 md:gap-6 md:px-6">
      <Link
        href="/complaints"
        className="inline-flex w-fit items-center gap-2 text-sm text-[#6b56e0] hover:underline dark:text-[#8E8EFF]"
      >
        <ArrowLeft size={16} />
        Back to Resolution Hub
      </Link>

      <Card variant="panel" blur contentClassName="flex flex-col gap-5">
        <header>
          <h1 className={`text-xl font-semibold md:text-2xl ${ink}`}>
            File a complaint
          </h1>
          <p className={`mt-2 text-sm ${muted}`}>
            Free mediation between you and the casino. Step {step} of 3.
          </p>
        </header>

        {!accessToken ? (
          <p className="rounded-xl border border-[#8874ff]/30 bg-[#8874ff]/10 px-3 py-2 text-xs text-white/80">
            You can save a draft in this browser without signing in. Sign in
            before submitting so the resolver queue can reach you.
          </p>
        ) : null}

        {error ? (
          <p className="text-sm text-[#FB3748]" role="alert">
            {error}
          </p>
        ) : null}

        {step === 1 ? (
          <div className="flex flex-col gap-4">
            <Dropdown
              theme="auto"
              options={casinoOptions}
              value={casinoId}
              onChange={setCasinoId}
              placeholder="Select casino"
              searchable
              panelWidth={280}
            />
            <Dropdown
              theme="auto"
              options={FORM_CATEGORIES}
              value={category}
              onChange={setCategory}
              placeholder="Select category"
              panelWidth={240}
            />
            <div className="flex justify-end">
              <button
                type="button"
                disabled={!casinoId || !category}
                onClick={() => setStep(2)}
                className="rounded-full bg-[#8874ff] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className={`text-sm font-medium ${ink}`}>Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={COMPLAINT_FIELD_LIMITS.titleMax}
                className="h-10 rounded-xl border border-[rgba(42,39,78,0.12)] bg-white/50 px-3 text-sm outline-none dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-white"
                placeholder="Short summary of the dispute"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={`text-sm font-medium ${ink}`}>What happened?</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                maxLength={COMPLAINT_FIELD_LIMITS.descriptionMax}
                className="rounded-xl border border-[rgba(42,39,78,0.12)] bg-white/50 px-3 py-2 text-sm outline-none dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-white"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className={`text-sm font-medium ${ink}`}>
                  Disputed amount (optional)
                </span>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputMode="decimal"
                  className="h-10 rounded-xl border border-[rgba(42,39,78,0.12)] bg-white/50 px-3 text-sm outline-none dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-white"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className={`text-sm font-medium ${ink}`}>Currency</span>
                <input
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  className="h-10 rounded-xl border border-[rgba(42,39,78,0.12)] bg-white/50 px-3 text-sm outline-none dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-white"
                />
              </label>
            </div>
            <div className="flex justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`text-sm ${muted}`}
              >
                Back
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  const id = await saveDraftPatch();
                  if (id) setStep(3);
                }}
                className="rounded-full bg-[#8874ff] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {busy ? "Saving…" : "Review"}
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col gap-4">
            <div className={`rounded-2xl border border-[rgba(42,39,78,0.08)] p-4 text-sm dark:border-white/[0.08] ${muted}`}>
              <p>
                <span className={`font-medium ${ink}`}>Casino:</span>{" "}
                {casinoOptions.find((c) => c.value === casinoId)?.label ?? "—"}
              </p>
              <p className="mt-2">
                <span className={`font-medium ${ink}`}>Category:</span>{" "}
                {FORM_CATEGORIES.find((c) => c.value === category)?.label ??
                  "—"}
              </p>
              <p className="mt-2">
                <span className={`font-medium ${ink}`}>Title:</span> {title}
              </p>
              {amount ? (
                <p className="mt-2">
                  <span className={`font-medium ${ink}`}>Amount:</span> {amount}{" "}
                  {currency}
                </p>
              ) : null}
            </div>
            <p className={`text-xs ${muted}`}>
              By submitting, you agree to our{" "}
              <Link href="/complaints/rules" className="text-[#8E8EFF] hover:underline">
                Resolution Rules
              </Link>
              . The case becomes visible to the casino after resolver approval.
            </p>
            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`text-sm ${muted}`}
              >
                Back
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void onSubmit()}
                className="rounded-full bg-[#8874ff] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {busy ? "Submitting…" : "Submit to resolver queue"}
              </button>
            </div>
          </div>
        ) : null}
      </Card>
    </main>
  );
}
