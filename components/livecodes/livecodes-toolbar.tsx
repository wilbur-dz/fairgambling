"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

function TelegramGlyph({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.835)}
      viewBox="0 0 19.9993 16.7087"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M18.6333 0.0682817L0.520753 7.07726C0.509976 7.08141 0.49953 7.08638 0.489503 7.09211C0.342628 7.17531 -0.682372 7.80226 0.76294 8.36441L0.777784 8.36981L5.09068 9.8671L16.353 3.15725C16.6779 2.95867 17.0471 3.34741 16.7788 3.58091L7.51369 11.5455L7.20435 15.448C7.192 15.6071 7.30428 15.7486 7.46021 15.7705C7.56751 15.7856 7.67555 15.7471 7.74634 15.6687L10.2105 12.9189L14.5024 16.3228C14.9409 16.6706 15.5819 16.4234 15.6859 15.8786L19.9616 0.980367C20.071 -0.000932693 18.96 -0.493793 18.6333 0.0682817Z"
        fill="currentColor"
      />
    </svg>
  );
}

type LiveCodesToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

/** Search + Telegram CTA — top of Live Codes main. */
export function LiveCodesToolbar({
  search,
  onSearchChange,
}: LiveCodesToolbarProps) {
  const [telegramOpen, setTelegramOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="light-element dark-glass-element relative flex h-[42px] w-full items-center gap-2 rounded-[22px] px-4 sm:w-[260px] sm:shrink-0">
          <Search
            size={16}
            className="shrink-0 text-[rgba(42,39,78,0.5)] dark:text-white/50"
            aria-hidden
          />
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search codes or casinos…"
            className="w-full bg-transparent text-[14px] font-light text-[#2a274e] placeholder:text-[rgba(42,39,78,0.5)] focus:outline-none dark:text-white dark:placeholder:text-white/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTelegramOpen(true)}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-[52px] border border-[rgba(42,39,78,0.2)] bg-[rgba(142,142,255,0.04)] backdrop-blur-[35.5px] transition-colors hover:bg-[rgba(142,142,255,0.08)] md:hidden dark:border-white/20"
            aria-label="Never miss a drop"
          >
            <TelegramGlyph
              size={18}
              className="text-[#6b56e0] dark:text-[#8e8eff]"
            />
          </button>
          <button
            type="button"
            onClick={() => setTelegramOpen(true)}
            className="hidden items-center justify-center gap-2.5 rounded-[52px] border border-[rgba(42,39,78,0.2)] bg-[rgba(142,142,255,0.04)] px-[14px] py-2 backdrop-blur-[35.5px] transition-colors hover:bg-[rgba(142,142,255,0.08)] md:inline-flex dark:border-white/20"
          >
            <TelegramGlyph
              size={24}
              className="text-[#6b56e0] dark:text-[#8e8eff]"
            />
            <span className="text-[14px] font-medium text-[#6b56e0] md:text-[16px] dark:text-[#8e8eff]">
              Never miss a drop
            </span>
          </button>
        </div>
      </div>

      <Modal
        open={telegramOpen}
        onClose={() => setTelegramOpen(false)}
        padded={false}
        className="max-w-[400px]"
        ariaLabel="Never Miss a Code Drop"
      >
        <div className="flex flex-col items-center gap-5 p-6 text-center">
          <TelegramGlyph
            size={40}
            className="text-[#6b56e0] dark:text-[#8e8eff]"
          />
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-[#2a274e] dark:text-white">
              Never Miss a Code Drop
            </h3>
            <p className="text-sm text-[rgba(42,39,78,0.6)] dark:text-white/60">
              Join our Telegram to stay updated on every drop.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            className="w-full justify-center"
            onClick={() => {
              window.open(
                "https://t.me/faircodes",
                "_blank",
                "noopener,noreferrer",
              );
            }}
          >
            Join the Code Feed
          </Button>
          <div className="flex w-full items-center gap-3">
            <div className="h-px flex-1 bg-[rgba(42,39,78,0.1)] dark:bg-white/10" />
            <span className="text-xs text-[rgba(42,39,78,0.4)] dark:text-white/40">
              or
            </span>
            <div className="h-px flex-1 bg-[rgba(42,39,78,0.1)] dark:bg-white/10" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-[#2a274e] dark:text-white">
              Only care about specific casinos?
            </p>
            <p className="text-[13px] text-[rgba(42,39,78,0.55)] dark:text-white/50">
              Set up custom notifications — only get codes for casinos you
              actually play on.
            </p>
          </div>
          <Button
            variant="ghost"
            theme="auto"
            size="md"
            className="w-full justify-center"
            onClick={() => {
              window.open(
                "https://t.me/fairgamblingbot",
                "_blank",
                "noopener,noreferrer",
              );
            }}
          >
            Set up @fairgamblingbot
          </Button>
        </div>
      </Modal>
    </>
  );
}
