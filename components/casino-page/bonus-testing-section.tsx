import { Card } from "@/components/ui/card";
import type { CasinoDetail } from "@/lib/casinos/casino-page";
import {
  getBonusTestingRecord,
  hasBonusTestingIntro,
  type BonusTestingLine,
  type BonusTestingRecord,
  type BonusTestingSession,
} from "@/lib/casinos/bonus-testing";

function SessionCard({
  variant,
  result,
  bonuses,
  totals,
}: {
  variant: "profit" | "loss";
  result: string;
  bonuses: BonusTestingLine[];
  totals: BonusTestingLine[];
}) {
  const valueClass = "text-[#2a274e] dark:text-white";
  const mutedClass = "text-[rgba(42,39,78,0.55)] dark:text-white/50";
  const isProfit = variant === "profit";
  const visibleTotals = isProfit
    ? totals
    : totals.filter((row) => row.label.trim().toLowerCase() !== "total");

  return (
    <Card variant="glass" contentClassName="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 text-[16px] font-medium">
        <span className={valueClass}>
          {isProfit ? "Session: Profit" : "Session: Loss"}
        </span>
        <span
          style={{ color: isProfit ? "var(--nd-profit)" : "var(--nd-loss)" }}
        >
          {result}
        </span>
      </div>

      <div className="flex flex-col gap-3 text-[14px]">
        {bonuses.map((line) => (
          <div
            key={line.label}
            className="flex items-start justify-between gap-2"
          >
            <span className="text-[rgba(42,39,78,0.45)] dark:text-white/30">
              {line.label}
              {line.note ? (
                <span className="ml-1 text-[rgba(42,39,78,0.35)] dark:text-white/20">
                  {line.note}
                </span>
              ) : null}
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-right">
              <span className={valueClass}>{line.pct}</span>
              <span className={mutedClass}>{line.amount}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="h-px w-full bg-[rgba(42,39,78,0.1)] dark:bg-white/10" />

      {visibleTotals.map((line) => (
        <div
          key={line.label}
          className="flex items-start justify-between gap-2 text-[14px]"
        >
          <span className={valueClass}>{line.label}</span>
          <span className="flex shrink-0 items-center gap-1.5 text-right">
            <span className={valueClass}>{line.pct}</span>
            <span className={mutedClass}>{line.amount}</span>
          </span>
        </div>
      ))}
    </Card>
  );
}

function SessionGrid({
  profit,
  loss,
}: {
  profit?: BonusTestingSession;
  loss?: BonusTestingSession;
}) {
  const hasBoth = Boolean(profit && loss);
  return (
    <div className={`grid grid-cols-1 gap-4 ${hasBoth ? "md:grid-cols-2" : ""}`}>
      {profit ? (
        <SessionCard
          variant="profit"
          result={profit.balance}
          bonuses={profit.bonuses}
          totals={profit.totals}
        />
      ) : null}
      {loss ? (
        <SessionCard
          variant="loss"
          result={loss.balance}
          bonuses={loss.bonuses}
          totals={loss.totals}
        />
      ) : null}
    </div>
  );
}

function TestingIntro({ record }: { record: BonusTestingRecord }) {
  if (!hasBonusTestingIntro(record)) return null;
  const valueClass = "text-[#2a274e] dark:text-white";
  const mutedClass = "text-[rgba(42,39,78,0.55)] dark:text-white/50";

  return (
    <p className={`text-[14px] leading-relaxed ${mutedClass}`}>
      We tested two accounts with a{" "}
      <span className={`font-semibold ${valueClass}`}>
        {record.deposit} deposit
      </span>{" "}
      and{" "}
      <span className={`font-semibold ${valueClass}`}>
        {record.wager} wagered
      </span>{" "}
      each on 1% house-edge games. One ended in profit, the other in loss —
      below are the actual bonuses each account received.
    </p>
  );
}

function FullTestingBody({ record }: { record: BonusTestingRecord & { type: "full" } }) {
  const noteClass = "text-[12px] italic leading-relaxed text-[rgba(42,39,78,0.45)] dark:text-white/40";
  const summaryClass = "text-[14px] leading-relaxed text-[rgba(42,39,78,0.55)] dark:text-white/50";

  return (
    <>
      {record.note ? <p className={noteClass}>{record.note}</p> : null}
      <SessionGrid profit={record.profit} loss={record.loss} />
      {record.summary ? <p className={summaryClass}>{record.summary}</p> : null}
    </>
  );
}

function SingleTestingBody({
  record,
}: {
  record: BonusTestingRecord & { type: "single" };
}) {
  const noteClass = "text-[12px] italic leading-relaxed text-[rgba(42,39,78,0.45)] dark:text-white/40";

  return (
    <>
      {record.note ? <p className={noteClass}>{record.note}</p> : null}
      <SessionGrid
        profit={record.scenarioType === "profit" ? record.scenario : undefined}
        loss={record.scenarioType === "loss" ? record.scenario : undefined}
      />
    </>
  );
}

function PartialTestingBody({
  record,
}: {
  record: BonusTestingRecord & { type: "partial" };
}) {
  const valueClass = "text-[#2a274e] dark:text-white";
  const mutedClass = "text-[rgba(42,39,78,0.55)] dark:text-white/50";
  const noteClass = "text-[12px] italic leading-relaxed text-[rgba(42,39,78,0.45)] dark:text-white/40";

  return (
    <>
      {record.totalRakeback && !record.profit && !record.loss ? (
        <Card variant="glass" contentClassName="flex items-center justify-between gap-2">
          <span className={`text-[14px] font-medium ${valueClass}`}>
            Total Rakeback
          </span>
          <span className="flex items-baseline gap-2">
            <span className={`text-[18px] font-bold ${valueClass}`}>
              {record.totalRakeback.pct}
            </span>
            <span className={`text-[13px] ${mutedClass}`}>
              {record.totalRakeback.amount}
            </span>
          </span>
        </Card>
      ) : null}
      {record.profit || record.loss ? (
        <SessionGrid profit={record.profit} loss={record.loss} />
      ) : null}
      {record.note ? <p className={noteClass}>{record.note}</p> : null}
    </>
  );
}

type BonusTestingSectionProps = {
  casino: CasinoDetail;
};

/** Port of reference `BonusTestingSection` (2-7hhq-z71oqb.js 751–1631). */
export function BonusTestingSection({ casino }: BonusTestingSectionProps) {
  const record = getBonusTestingRecord(casino.slug);
  const titleClass = "text-[#2a274e] dark:text-white";
  const emptyClass =
    "text-[rgba(42,39,78,0.45)] dark:text-white/40";

  return (
    <Card
      id="bonus-testing"
      variant="panel"
      blur
      className="scroll-mt-24"
      contentClassName="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-1">
        <h2 className={`text-[18px] font-medium ${titleClass}`}>
          Bonus Testing
        </h2>
        <TestingIntro record={record} />
      </div>

      {record.type === "full" ? <FullTestingBody record={record} /> : null}

      {record.type === "single" ? <SingleTestingBody record={record} /> : null}

      {record.type === "partial" ? <PartialTestingBody record={record} /> : null}

      {record.type === "none" ? (
        <Card
          variant="glass"
          contentClassName={`py-10 text-center text-[14px] ${emptyClass}`}
        >
          {record.note ?? "We haven't gone undercover here yet — but we will."}
        </Card>
      ) : null}
    </Card>
  );
}
