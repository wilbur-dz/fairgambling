"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Copy } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { CarouselNav } from "@/components/ui/carousel-nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LiveBadge } from "@/components/ui/live-badge";
import { RedeemModal } from "@/components/ui/redeem-modal";
import { getCasinoLogoPair } from "@/lib/casinos/logos";
import {
  MOCK_CODE_DROPS,
  formatCurrency,
  type CodeDropOffer,
} from "@/lib/home/data";
import { useLiveCodesSSE } from "@/lib/home/use-live-codes-sse";
import { formatRelativeTime } from "@/lib/reviews/format";

const SCROLL_STEP = 364;

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#637083]">{label}</span>
      <span className="font-medium text-[#2a274e] dark:text-white">{value}</span>
    </div>
  );
}

function CodeDropCard({
  offer,
  onOpen,
}: {
  offer: CodeDropOffer;
  onOpen: () => void;
}) {
  const [bannerFailed, setBannerFailed] = useState(false);
  const logoPair = getCasinoLogoPair(offer.casinoSlug || "");

  return (
    <Card
      variant="glass"
      theme="auto"
      ring={false}
      padded={false}
      className="light-element dark-glass-element w-[320px] shrink-0 cursor-pointer transition-opacity hover:opacity-90"
      contentClassName="flex flex-col gap-4 p-4"
      onClick={onOpen}
    >
      <div className="flex h-[96px] w-full items-center justify-center overflow-hidden rounded-[12px] bg-[#2a274e]/[0.04] dark:bg-white/[0.04]">
        {offer.casinoLogoUrl && !bannerFailed ? (
          <Image
            src={offer.casinoLogoUrl}
            alt={offer.casinoName}
            width={320}
            height={96}
            className="size-full object-cover"
            onError={() => setBannerFailed(true)}
          />
        ) : logoPair ? (
          <>
            <Image
              src={logoPair.light}
              alt={offer.casinoName}
              width={180}
              height={48}
              className="h-[72px] w-auto max-w-[80%] object-contain dark:hidden"
            />
            <Image
              src={logoPair.dark}
              alt=""
              width={180}
              height={48}
              className="hidden h-[72px] w-auto max-w-[80%] object-contain dark:block"
            />
          </>
        ) : (
          <span className="text-2xl font-bold text-[#2a274e]/80 dark:text-white/80">
            {offer.casinoName}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[18px] leading-[28px]">{offer.offerIcon}</span>
          <h3 className="text-[18px] font-medium leading-[28px] text-[#2a274e] dark:text-[#f9fafb]">
            {offer.offerTitle}
          </h3>
        </div>

        <div className="flex flex-col gap-1.5 text-[16px]">
          <MetaRow
            label="Total Claims:"
            value={offer.totalClaims > 0 ? String(offer.totalClaims) : "—"}
          />
          <MetaRow
            label="Wager Req:"
            value={
              offer.wagerReq > 0 ? formatCurrency(offer.wagerReq) : "—"
            }
          />
          <MetaRow label="Value:" value={offer.value} />
        </div>

        <div className="h-px w-full bg-[#2a274e]/10 dark:bg-white/10" />

        <div className="flex items-center justify-between gap-2">
          <span
            aria-hidden
            className="inline-flex items-center gap-2 rounded-[6px] px-[9px] py-[5px] text-[14px] font-medium text-[#5f4bc1] dark:text-[#dfd4fe]"
            style={{
              background: "rgba(79,45,236,0.06)",
              boxShadow:
                "inset 0 0 1px rgba(79,45,236,0.7), 0 0 8px rgba(79,45,236,0.15)",
            }}
          >
            {offer.code}
            <Copy size={16} />
          </span>
          <span
            suppressHydrationWarning
            className="text-[14px] text-[#97a1af]"
          >
            {formatRelativeTime(offer.createdAt)}
          </span>
        </div>
      </div>
    </Card>
  );
}

/** `eb` — Code drop feed (SSE preferred, SSR/REST seed, mock fallback). */
export function CodeDropFeed({
  codes,
}: {
  codes?: CodeDropOffer[];
}) {
  const { codes: liveCodes } = useLiveCodesSSE({ autoConnect: true });

  const offers = useMemo(() => {
    if (liveCodes.length > 0) return liveCodes.slice(0, 10);
    if (codes && codes.length > 0) return codes.slice(0, 10);
    return MOCK_CODE_DROPS;
  }, [codes, liveCodes]);

  const [selected, setSelected] = useState<CodeDropOffer | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollByCards = (direction: number) => {
    scrollerRef.current?.scrollBy({
      left: SCROLL_STEP * direction,
      behavior: "smooth",
    });
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <LiveBadge theme="auto" className="!h-[26px] !text-[13px]" />
          <h2 className="truncate text-[15px] font-medium text-[#2a274e] sm:text-[18px] dark:text-white">
            Code Drop Feed
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-3 sm:flex">
            <CarouselNav
              onPrev={() => scrollByCards(-1)}
              onNext={() => scrollByCards(1)}
              theme="auto"
            />
            <span className="h-5 w-px bg-[#2a274e]/10 dark:bg-white/10" />
          </div>
          <Link href="/livecodes">
            <Button
              variant="ghost"
              theme="auto"
              size="sm"
              rightIcon={<ArrowUpRight />}
            >
              View All
            </Button>
          </Link>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="scrollbar-hide -mx-4 flex gap-6 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: "none" }}
      >
        {offers.map((offer) => (
          <CodeDropCard
            key={offer.id}
            offer={offer}
            onOpen={() => setSelected(offer)}
          />
        ))}
      </div>

      {selected ? (
        <RedeemModal
          code={selected.code}
          casinoSlug={selected.casinoSlug ?? null}
          casinoName={selected.casinoName ?? null}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </section>
  );
}
