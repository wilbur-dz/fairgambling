"use client";

import {
  AffiliateIcon,
  IconTile,
  SectionHeader,
} from "@/components/affiliate/chrome";
import { BENEFITS } from "@/lib/affiliate/data";

/** Port of reference `Benefits`. */
export function AffiliateBenefits() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title="Affiliate Benefits" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {BENEFITS.map((item) => (
          <div
            key={item.title}
            className="flex flex-col gap-4 rounded-[20px] border border-[#e4e4e7] bg-[#e4e4e7]/30 px-4 py-3 backdrop-blur-[20px] md:gap-6 md:p-4 dark:border-0 dark:bg-white/[0.02]"
          >
            <IconTile>
              <AffiliateIcon icon={item.icon} iconSrc={item.iconSrc} />
            </IconTile>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold text-[#2a274e] dark:text-white">
                {item.title}
              </h3>
              <p className="text-[12px] leading-relaxed text-[rgba(42,39,78,0.5)] dark:text-white/50">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
