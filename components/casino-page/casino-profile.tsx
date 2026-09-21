import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
  CASINO_SOCIALS,
  getCasinoWebsiteUrl,
  type CasinoDetail,
} from "@/lib/casinos/casino-page";
import {
  licenseImageSrc,
  type CasinoRatingDetail,
} from "@/lib/casinos/data";
import {
  getCasinoLogoPair,
  surfaceTile,
} from "@/lib/casinos/logos";

const SOCIAL_BTN =
  "flex items-center justify-center rounded-lg border-[0.5px] border-[#2a274e]/[0.12] bg-white/[0.6] p-2 text-[#2a274e]/70 transition-colors hover:bg-white hover:text-[#2a274e] dark:border-white/20 dark:bg-white/[0.01] dark:text-white/70 dark:hover:bg-white/[0.06] dark:hover:text-white";

function StatField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="truncate text-[14px] font-normal leading-[18px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
        {label}
      </span>
      <span className="flex items-center gap-1.5 text-[16px] font-semibold leading-[21px] text-[#2a274e] dark:text-white">
        {children}
      </span>
    </div>
  );
}

function licenseIconKey(name: string | null | undefined): string {
  const n = (name ?? "").toLowerCase();
  if (n.includes("cura")) return "curacao";
  if (n.includes("anjouan")) return "anjouan";
  if (n.includes("tobique") || n.includes("kahnawake")) return "tobique";
  if (n.includes("malta")) return "malta";
  if (n.includes("uk")) return "uk";
  return n;
}

type CasinoProfileProps = {
  casino: CasinoDetail;
  rating?: CasinoRatingDetail | null;
};

/** Port of reference `CasinoProfile`. */
export function CasinoProfile({ casino, rating }: CasinoProfileProps) {
  const meta = casino.meta ?? {};
  const overview = meta.overview ?? {};
  const socialLinks =
    (meta as { socialLinks?: Record<string, string> }).socialLinks ??
    (casino.facts as { socialLinks?: Record<string, string> } | null)
      ?.socialLinks ??
    {};
  const fallback = CASINO_SOCIALS[casino.slug] ?? {};
  const telegram = socialLinks.telegram || fallback.telegram;
  const twitter = socialLinks.x || socialLinks.twitter || fallback.x;
  const website = getCasinoWebsiteUrl(casino.slug, casino.websiteUrl);
  const logoPair = getCasinoLogoPair(casino.slug, { withBg: true });
  const license = overview.license ?? rating?.license ?? null;
  const licenseLogo = license
    ? licenseImageSrc(licenseIconKey(license))
    : null;

  const totalSlots = overview.totalSlots;
  const totalProviders = overview.totalProviders;
  const sportsbook = overview.sportsbook;
  const avgHouseRtp = overview.avgHouseGameRtp;
  const avgVig = rating?.sportsEdgeVig ?? overview.avgVigSports ?? null;
  const rakeback = rating?.hideEstimatedRakeback
    ? null
    : (rating?.estimatedRakeback?.total ?? null);
  const estimatedNgr = rating?.estimatedNgr ?? null;

  return (
    <Card
      variant="panel"
      theme="auto"
      blur
      contentClassName="flex flex-col gap-6 md:flex-row md:items-start"
    >
      <div className="flex shrink-0 flex-col items-center gap-4">
        <div className="relative size-[130px] shrink-0 overflow-hidden rounded-[24px] bg-[rgba(42,39,78,0.04)] dark:bg-white/[0.04]">
          {casino.logoUrl ? (
            <Image
              src={casino.logoUrl}
              alt={casino.name}
              fill
              sizes="130px"
              className="object-contain"
              unoptimized
            />
          ) : logoPair ? (
            <>
              <Image
                src={surfaceTile(logoPair, casino.slug, true)}
                alt={casino.name}
                fill
                sizes="130px"
                className="object-contain dark:hidden"
              />
              <Image
                src={surfaceTile(logoPair, casino.slug, false)}
                alt=""
                fill
                sizes="130px"
                className="hidden object-contain dark:block"
              />
            </>
          ) : (
            <div className="flex size-full items-center justify-center text-3xl font-bold text-[#2a274e] dark:text-white">
              {casino.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          {telegram ? (
            <a
              href={telegram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className={SOCIAL_BTN}
            >
              <Icon name="telegram-icon" size={16} />
            </a>
          ) : null}
          {twitter ? (
            <a
              href={twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className={SOCIAL_BTN}
            >
              <Icon name="x-icon" size={16} />
            </a>
          ) : null}
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Website"
            className={SOCIAL_BTN}
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="truncate text-[32px] font-bold leading-10 text-[#2a274e] dark:text-white">
            {casino.name} Review
          </h1>
          {casino.foundedYear != null ? (
            <span className="shrink-0 text-[14px] text-[rgba(42,39,78,0.5)] dark:text-white/50">
              Founded {casino.foundedYear}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 border-t border-[rgba(42,39,78,0.1)] pt-4 dark:border-white/10">
          <div className="flex flex-wrap gap-4">
            <StatField label="License">
              {licenseLogo ? (
                <Image
                  src={licenseLogo}
                  alt=""
                  width={17}
                  height={20}
                  className="h-5 w-auto shrink-0"
                />
              ) : null}
              <span className="truncate">{license ?? "—"}</span>
            </StatField>
            <StatField label="Total Games">
              {totalSlots ? `${totalSlots.toLocaleString("en-US")}+` : "—"}
            </StatField>
            <StatField label="Providers">
              {totalProviders ? `${totalProviders}+` : "—"}
            </StatField>
            <StatField label="Sportsbook">
              <span className="truncate">{sportsbook ?? "—"}</span>
            </StatField>
          </div>
          <div className="flex flex-wrap gap-4">
            <StatField label="Avg House RTP">
              {avgHouseRtp != null ? `${avgHouseRtp}%` : "—"}
            </StatField>
            <StatField label="Sports Edge">
              {avgVig != null ? `${avgVig}%` : "—"}
            </StatField>
            <StatField label="Est. Rakeback">{rakeback ?? "—"}</StatField>
            <StatField label="Est. NGR">{estimatedNgr ?? "—"}</StatField>
          </div>
        </div>
      </div>
    </Card>
  );
}
