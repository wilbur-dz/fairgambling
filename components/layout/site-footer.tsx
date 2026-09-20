"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { BrandMark } from "@/components/ui/brand-mark";
import { Icon } from "@/components/ui/icon";
import { useIsMobile } from "@/hooks/use-is-mobile";
import {
  FOOTER_BONUSES,
  FOOTER_CASINO_BRANDS,
  FOOTER_CASINO_CODES,
  FOOTER_CASINOS,
  FOOTER_NEWSROOM,
  FOOTER_TOOLS,
  RESPONSIBLE_GAMBLING_LINKS,
  SOCIAL_LINKS,
  filterFooterOtherLinks,
  type FooterLinkItem,
} from "@/lib/navigation";

const LINK_CLASS =
  "text-[13px] text-[#2a274e]/55 transition-colors hover:text-[#8874ff] dark:text-white/45";
const TITLE_CLASS = "text-sm font-semibold text-[#2a274e] dark:text-white";

declare global {
  interface Window {
    Intercom?: (command: string, ...args: unknown[]) => void;
  }
}

function openSupport() {
  try {
    window.Intercom?.("show");
  } catch {
    // Intercom may be unavailable in local/dev builds.
  }
}

function FooterLink({ item }: { item: FooterLinkItem }) {
  if (item.href === "#support") {
    return (
      <button
        type="button"
        onClick={openSupport}
        className={`text-left ${LINK_CLASS}`}
      >
        {item.label}
      </button>
    );
  }

  return (
    <Link href={item.href} prefetch={false} className={LINK_CLASS}>
      {item.label}
    </Link>
  );
}

function FooterLinkList({ items }: { items: FooterLinkItem[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.label}>
          <FooterLink item={item} />
        </li>
      ))}
    </ul>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: FooterLinkItem[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className={TITLE_CLASS}>{title}</h3>
      <FooterLinkList items={items} />
    </div>
  );
}

function BonusesColumn() {
  return (
    <div className="flex flex-col gap-4">
      <h3 className={TITLE_CLASS}>Bonuses</h3>
      <ul className="flex flex-col gap-3 leading-[20px]">
        {FOOTER_BONUSES.map((item) =>
          item.href === "/livecodes" ? (
            <li key={item.label}>
              <ul className="scrollbar-hide flex max-h-[20px] flex-col gap-3 overflow-y-auto">
                <li>
                  <FooterLink item={item} />
                </li>
                {FOOTER_CASINO_CODES.map((code) => (
                  <li key={code.label}>
                    <FooterLink item={code} />
                  </li>
                ))}
              </ul>
            </li>
          ) : (
            <li key={item.label}>
              <FooterLink item={item} />
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

function CasinoBrandsList() {
  return (
    <ul className="scrollbar-hide flex max-h-[88px] flex-col gap-3 overflow-y-auto leading-[20px]">
      {FOOTER_CASINO_BRANDS.map((item) => (
        <li key={item.label}>
          <Link href={item.href} prefetch={false} className={LINK_CLASS}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function BrandBlock() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <BrandMark size={30} />
        <Image
          src="/icons/fairgambling-text.svg"
          alt="FairGambling"
          width={116}
          height={13}
          className="h-[13px] w-auto dark:hidden"
        />
        <Image
          src="/icons/fairgambling-text-dark.svg"
          alt=""
          width={116}
          height={13}
          className="hidden h-[13px] w-auto dark:block"
        />
      </div>
      <p className="max-w-[230px] text-sm text-[#2a274e]/55 dark:text-white/45">
        Bringing trust and transparency to iGaming
      </p>
      <div className="flex items-center gap-3">
        {SOCIAL_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-10 items-center justify-center rounded-lg bg-[#2a274e]/[0.04] text-[#2a274e] transition-colors hover:bg-[#2a274e]/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/10"
            aria-label={link.label}
          >
            <Icon
              name={link.icon}
              size={20}
              className="text-[#2a274e] dark:text-white"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

function ResponsibleFooter() {
  return (
    <div className="flex flex-col items-center gap-2 border-t border-[#2a274e]/10 pt-6 dark:border-white/[0.08]">
      <p className="text-[13px] text-[#2a274e]/55 dark:text-white/45">
        18+ | Gambling can be addictive. Please play responsibly.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {RESPONSIBLE_GAMBLING_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-[#2a274e]/45 underline underline-offset-2 transition-colors hover:text-[#8874ff] dark:text-white/35"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <p
        className="pt-2 text-[13px] text-[#2a274e]/45 dark:text-white/35"
        suppressHydrationWarning
      >
        © {new Date().getFullYear()} FairGambling
      </p>
    </div>
  );
}

/** Port of reference footer `eN`. */
export function SiteFooter() {
  const isMobile = useIsMobile();
  const otherLinks = useMemo(() => filterFooterOtherLinks(), []);

  return (
    <footer className="px-4 pb-10 pt-12 md:px-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-10">
        {isMobile ? (
          <>
            <BrandBlock />
            <div className="grid grid-cols-2 gap-x-6 gap-y-8">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <h3 className={TITLE_CLASS}>Casinos</h3>
                  <FooterLinkList items={FOOTER_CASINOS} />
                  <CasinoBrandsList />
                </div>
                <FooterColumn title="Newsroom" items={FOOTER_NEWSROOM} />
                <FooterColumn title="Other" items={otherLinks} />
              </div>
              <div className="flex flex-col gap-8">
                <BonusesColumn />
                <FooterColumn title="Tools" items={FOOTER_TOOLS} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
            <BrandBlock />
            <div className="flex flex-wrap gap-x-10 gap-y-8">
              <FooterColumn title="Casinos" items={FOOTER_CASINOS} />
              <div className="flex flex-col gap-4">
                <h3 className="select-none text-sm font-semibold text-transparent">
                  .
                </h3>
                <CasinoBrandsList />
              </div>
              <BonusesColumn />
              <FooterColumn title="Tools" items={FOOTER_TOOLS} />
              <FooterColumn title="Newsroom" items={FOOTER_NEWSROOM} />
              <FooterColumn title="Other" items={otherLinks} />
            </div>
          </div>
        )}
        <ResponsibleFooter />
      </div>
    </footer>
  );
}
