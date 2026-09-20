import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SlotMachineGrid } from "@/components/home/slot-machine-grid";

/** `d` — Hero banner (static marketing + Discover CTA + slot-machine décor). */
export function HomeHero() {
  return (
    <Card
      variant="panel"
      theme="auto"
      padded={false}
      className="isolate h-[180px] p-5 [clip-path:inset(0_round_24px)] md:h-[211px] md:p-6"
      contentClassName="relative flex h-full items-center"
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
      <div className="relative z-20 flex flex-col gap-4 md:gap-5">
        <div className="flex flex-col gap-1.5 md:gap-2">
          <h1 className="whitespace-nowrap text-[20px] font-medium leading-normal text-[#2a274e] dark:text-white md:text-[24px]">
            Your Crypto Gambling Hub
          </h1>
          <p className="text-[14px] font-normal leading-snug text-[#2a274e] dark:text-white md:text-[16px] md:leading-normal">
            Discover trusted casinos, earn rewards
            <br />
            &amp; play smarter.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:hidden">
          <Link href="/casinos">
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight />}
              className="whitespace-nowrap"
            >
              Discover
            </Button>
          </Link>
        </div>
        <div className="hidden flex-wrap items-center gap-3 md:flex">
          <Link href="/casinos">
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight />}
              className="whitespace-nowrap"
            >
              Discover
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
