"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import { AnalyticsCasinoIcon } from "@/components/ui/analytics-casino-icon";
import { RedeemModal } from "@/components/ui/redeem-modal";
import { Watermark } from "@/components/ui/watermark";
import { formatCurrency } from "@/lib/home/data";
import type { LiveCode } from "@/lib/livecodes/data";
import {
  calcValuePer1k,
  formatCodeValue,
} from "@/lib/livecodes/normalize";
import { formatRelativeTime } from "@/lib/reviews/format";

const HEADERS = [
  "Casino",
  "Code",
  "Value",
  "Time",
  "Total Claims",
  "Wager Req",
  "Value per 1k",
  "",
] as const;

const RIGHT_ALIGN = new Set([2, 3, 4, 5, 6]);
const HIDE_LG = new Set([3, 4, 5, 6]);

const THEME = {
  muted: "var(--nd-muted, rgba(42,39,78,0.4))",
  rowBorder: "var(--nd-hairline, rgba(42,39,78,0.08))",
  code: "var(--nd-code, #6b56e0)",
  green: "var(--nd-profit, #00ff86)",
  ink: "text-[#2a274e] dark:text-white",
  rowHover: "hover:bg-[rgba(42,39,78,0.02)] dark:hover:bg-white/[0.02]",
};

type CodesTableProps = {
  data: LiveCode[];
  isLoading?: boolean;
  onCasinoClick?: (slug: string) => void;
  claimsColumnLabel?: string;
  emptyMessage?: string;
};

/** Main codes table — columns map 1:1 from `/api/codes`. */
export function CodesTable({
  data,
  isLoading = false,
  onCasinoClick,
  claimsColumnLabel = "Total Claims",
  emptyMessage = "No codes available",
}: CodesTableProps) {
  const [redeemId, setRedeemId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState<Set<string>>(() => new Set());

  const copyCode = useCallback((code: string) => {
    void navigator.clipboard.writeText(code);
    setCopied(code);
    window.setTimeout(() => setCopied(null), 1500);
  }, []);

  const headers = [...HEADERS];
  headers[4] = claimsColumnLabel as (typeof HEADERS)[number];

  const selected = data.find((row) => String(row.id) === redeemId) ?? null;

  const isRedeemed = (row: LiveCode) =>
    row.status === "redeemed" ||
    row.status === "expired" ||
    redeemed.has(String(row.id));

  if (!isLoading && data.length === 0) {
    return (
      <p className="px-2 py-10 text-center text-[13px] text-[rgba(42,39,78,0.4)] dark:text-white/40">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={`transition-opacity ${isLoading ? "opacity-50" : ""}`}>
      <Watermark
        opacity={0.05}
        logoWidth={220}
        repeat={Math.max(1, Math.ceil(data.length / 10))}
      >
        <div className="scrollbar-hide overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-left lg:min-w-[900px]">
            <thead>
              <tr>
                {headers.map((label, index) => (
                  <th
                    key={`${label}-${index}`}
                    className={`whitespace-nowrap border-b px-2 pb-3 text-[12px] font-medium uppercase ${
                      RIGHT_ALIGN.has(index) ? "text-right" : ""
                    } ${index === 1 ? "w-full lg:w-auto" : ""} ${
                      HIDE_LG.has(index) ? "hidden lg:table-cell" : ""
                    }`}
                    style={{
                      color: THEME.muted,
                      borderColor: THEME.rowBorder,
                    }}
                  >
                    {index === 0 ? (
                      <span className="hidden lg:inline">{label}</span>
                    ) : (
                      label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={String(row.id)}
                  className={`transition-colors ${THEME.rowHover}`}
                >
                  <td
                    className="border-b px-2 py-2"
                    style={{ borderColor: THEME.rowBorder }}
                  >
                    <span className="flex items-center justify-center gap-0 lg:justify-start lg:gap-2.5">
                      <AnalyticsCasinoIcon
                        casinoName={row.casinoName}
                        size={26}
                        theme="auto"
                        logoUrl={row.casinoLogoUrl}
                      />
                      {onCasinoClick ? (
                        <button
                          type="button"
                          onClick={() => onCasinoClick(row.casinoSlug)}
                          className={`hidden truncate text-left text-[14px] font-medium lg:block ${THEME.ink} transition-colors hover:text-[#6b56e0] dark:hover:text-[#9A80F9]`}
                        >
                          {row.casinoName}
                        </button>
                      ) : (
                        <Link
                          href={`/${row.casinoSlug}`}
                          className={`hidden truncate text-[14px] font-medium lg:block ${THEME.ink} transition-colors hover:text-[#6b56e0] dark:hover:text-[#9A80F9]`}
                        >
                          {row.casinoName}
                        </Link>
                      )}
                    </span>
                  </td>

                  <td
                    className="w-full border-b px-2 py-2 lg:w-auto"
                    style={{ borderColor: THEME.rowBorder }}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className="block max-w-[80px] truncate text-[14px] font-normal lg:max-w-none"
                        style={{ color: THEME.code }}
                      >
                        {row.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyCode(row.code)}
                        className="shrink-0 text-[rgba(42,39,78,0.4)] transition-colors hover:text-[#2a274e] dark:text-white/40 dark:hover:text-white"
                        aria-label="Copy code"
                      >
                        {copied === row.code ? (
                          <Check size={14} style={{ color: THEME.green }} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </span>
                  </td>

                  <td
                    className={`border-b px-2 py-2 text-right text-[14px] font-semibold ${THEME.ink}`}
                    style={{ borderColor: THEME.rowBorder }}
                  >
                    <span className="ml-auto max-w-[90px] break-words text-right line-clamp-2 lg:max-w-none">
                      {formatCodeValue(row.codeValue)}
                    </span>
                  </td>

                  <td
                    className={`hidden border-b px-2 py-2 text-right text-[14px] lg:table-cell ${THEME.ink}`}
                    style={{ borderColor: THEME.rowBorder }}
                  >
                    {formatRelativeTime(row.createdAt)}
                  </td>

                  <td
                    className={`hidden border-b px-2 py-2 text-right text-[14px] lg:table-cell ${THEME.ink}`}
                    style={{ borderColor: THEME.rowBorder }}
                  >
                    {row.numberOfClaims > 0 ? row.numberOfClaims : "-"}
                  </td>

                  <td
                    className={`hidden border-b px-2 py-2 text-right text-[14px] lg:table-cell ${THEME.ink}`}
                    style={{ borderColor: THEME.rowBorder }}
                  >
                    {row.wagerRequirement > 0
                      ? formatCurrency(row.wagerRequirement)
                      : "—"}
                  </td>

                  <td
                    className={`hidden border-b px-2 py-2 text-right text-[14px] lg:table-cell ${THEME.ink}`}
                    style={{ borderColor: THEME.rowBorder }}
                  >
                    {calcValuePer1k(row.codeValue, row.wagerRequirement)}
                  </td>

                  <td
                    className="border-b px-2 py-2 text-right"
                    style={{ borderColor: THEME.rowBorder }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setRedeemId((prev) =>
                          prev === String(row.id) ? null : String(row.id),
                        )
                      }
                      disabled={isRedeemed(row)}
                      className={`inline-flex items-center justify-center gap-1 rounded-full border-[0.5px] px-3.5 py-1.5 text-[12px] font-medium transition-all ${
                        isRedeemed(row)
                          ? "cursor-default border-[rgba(42,39,78,0.12)] text-[rgba(42,39,78,0.4)] dark:border-white/15 dark:text-white/40"
                          : "border-[rgba(136,116,255,0.45)] text-[#6b56e0] hover:bg-[rgba(136,116,255,0.08)] dark:border-[rgba(154,128,249,0.45)] dark:text-[#9A80F9] dark:hover:bg-[rgba(154,128,249,0.1)]"
                      }`}
                    >
                      {isRedeemed(row) ? "Redeemed" : "Redeem"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Watermark>

      {selected ? (
        <RedeemModal
          code={selected.code}
          casinoSlug={selected.casinoSlug}
          casinoName={selected.casinoName}
          onClose={() => setRedeemId(null)}
          onRedeemed={() => {
            setRedeemed((prev) => new Set(prev).add(String(selected.id)));
          }}
        />
      ) : null}
    </div>
  );
}
