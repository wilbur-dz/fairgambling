import { SlotMachineGrid } from "@/components/complaints/slot-machine-grid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClickNav } from "@/components/ui/click-nav";

/** Port of reference `ResolutionHero` (999689 / 0vnq1p8q1mwpp.js). */
export function ResolutionHero() {
  return (
    <Card
      variant="panel"
      padded={false}
      className="p-5 md:p-6"
      contentClassName="relative flex min-h-[143px] items-center md:min-h-[153px]"
    >
      <div className="contents">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-16 z-0 bg-[linear-gradient(180deg,rgba(209,213,219,0.5)_0%,rgba(156,163,175,0.5)_100%)] md:hidden dark:bg-[linear-gradient(180deg,rgba(81,5,161,0.5)_0%,rgba(52,0,107,0.5)_100%)]"
          style={{ filter: "blur(90px)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-40px] top-1/2 z-0 hidden h-[344px] w-[465px] -translate-y-1/2 bg-[linear-gradient(180deg,rgba(209,213,219,0.5)_0%,rgba(156,163,175,0.5)_100%)] md:block dark:bg-[linear-gradient(180deg,rgba(81,5,161,0.5)_0%,rgba(52,0,107,0.5)_100%)]"
          style={{ filter: "blur(90px)" }}
        />
      </div>

      <SlotMachineGrid variant="glass" theme="auto" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-[5] hidden w-[65%] dark:md:block"
        style={{
          background: "linear-gradient(90deg, #0f1424 45%, transparent 100%)",
        }}
      />

      <div className="relative z-20 flex max-w-[300px] flex-col gap-5 md:max-w-[506px] md:gap-8">
        <p className="text-[14px] leading-[1.4] text-[rgba(42,39,78,0.8)] md:text-[16px] dark:text-white/80">
          File a complaint against any crypto casino. Every case and its outcome
          is public. See how a casino treats its players before you deposit.
        </p>
        <div className="flex flex-wrap items-center gap-2 md:hidden">
          <ClickNav href="/complaints/new">
            <Button variant="primary" size="sm" className="whitespace-nowrap">
              Submit a Complaint
            </Button>
          </ClickNav>
        </div>
        <div className="hidden flex-wrap items-center gap-4 md:flex">
          <ClickNav href="/complaints/new">
            <Button variant="primary" size="md" className="w-[161px]">
              Submit a Complaint
            </Button>
          </ClickNav>
        </div>
      </div>
    </Card>
  );
}
