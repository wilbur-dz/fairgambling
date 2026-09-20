import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

const accent = "text-[#8874ff]";

/** `j` — Transparency notice (static copy). */
export function TransparencyNotice() {
  return (
    <Card
      variant="panel"
      theme="auto"
      blur
      className="h-full"
      contentClassName="h-full"
    >
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck
            size={24}
            className="text-[#1f9d57] dark:text-[#00ff86]"
          />
          <h2 className="text-[18px] font-medium leading-normal text-[#2a274e] dark:text-white">
            Transparency Notice
          </h2>
        </div>
        <div className="flex flex-col gap-3 text-sm leading-normal text-[#2a274e]/80 dark:text-white/90">
          <p className="font-semibold">
            At{" "}
            <span className={`${accent} font-semibold`}>FairGambling.com</span>
            , transparency is our foundation.
          </p>
          <p>
            We never accept <span className="font-semibold">payments</span>,{" "}
            <span className="font-semibold">sponsorships</span>, or{" "}
            <span className="font-semibold">affiliate deals</span> that could
            influence our{" "}
            <span className={`${accent} font-semibold`}>Trust Rankings</span>.{" "}
            <span className="font-semibold">No exceptions</span>.
          </p>
          <p>
            Our only affiliate activity is through the{" "}
            <span className={`${accent} font-semibold`}>
              Wager Share Program
            </span>
            , where players can voluntarily sign up to receive wagering rewards.
            This program is{" "}
            <span className="font-semibold">
              fully separate from our rankings
            </span>{" "}
            and never impacts how casinos are rated.
          </p>
          <p>
            FairGambling stays fully independent thanks to the{" "}
            <span className="font-semibold">support of our</span>{" "}
            <span className={`${accent} font-semibold`}>community</span>.
          </p>
        </div>
        <div className="mt-auto flex justify-end pt-3">
          <Link
            href="/transparency"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#2a274e]/70 transition-colors hover:text-[#2a274e] dark:text-white/70 dark:hover:text-white"
          >
            Read more
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </Card>
  );
}
