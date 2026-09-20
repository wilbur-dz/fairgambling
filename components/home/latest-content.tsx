"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MOCK_CONTENT,
  SECTION_PATH,
  type ContentTeaser,
} from "@/lib/home/data";

/** `K` — Latest content / investigations (CMS SECTION_PATH). */
export function LatestContent({
  items = MOCK_CONTENT,
}: {
  items?: ContentTeaser[];
}) {
  const list = Array.isArray(items) && items.length > 0 ? items : MOCK_CONTENT;

  return (
    <Card
      variant="panel"
      theme="auto"
      blur
      className="w-full"
      contentClassName="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-medium text-[#2a274e] dark:text-white">
          <Link
            href="/news"
            target="_blank"
            rel="noopener"
            className="transition-colors hover:text-[#8874ff]"
          >
            <span className="sm:hidden">Latest Content</span>
            <span className="hidden sm:inline">Latest Investigations</span>
          </Link>
        </h2>
        <Link
          href={SECTION_PATH.research}
          target="_blank"
          rel="noopener"
        >
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

      <div className="flex flex-col">
        {list.map((item) => (
          <Link
            key={item.id}
            href={`${SECTION_PATH.research}/${item.id}`}
            target="_blank"
            rel="noopener"
            className="group flex items-center gap-3 border-b border-[#2a274e]/[0.08] py-3 dark:border-white/[0.06]"
          >
            <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[#2a274e]/[0.04] text-[#8874ff] dark:bg-white/[0.04]">
              {item.cover ? (
                <Image
                  src={item.cover}
                  alt=""
                  width={48}
                  height={48}
                  className="size-full object-cover"
                />
              ) : (
                <FileText size={20} />
              )}
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-sm font-semibold text-[#2a274e] transition-colors group-hover:text-[#8874ff] dark:text-white">
                {item.title.replace(/\n/g, " ")}
              </span>
              <span className="text-[11px] uppercase tracking-wide text-[#2a274e]/40 dark:text-white/40">
                {item.category}
              </span>
            </div>
          </Link>
        ))}

        <div
          className="relative flex items-center gap-3 py-3"
          aria-hidden
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-[12px] bg-[#2a274e]/[0.04] text-[#8874ff] blur-[2px] dark:bg-white/[0.04]">
            <FileText size={20} />
          </span>
          <div className="flex min-w-0 select-none flex-col gap-0.5 blur-[3px]">
            <span className="truncate text-sm font-semibold text-[#2a274e] dark:text-white">
              Lorem ipsum dolor sit amet
            </span>
            <span className="text-[11px] uppercase tracking-wide text-[#2a274e]/40 dark:text-white/40">
              Consectetur adipiscing
            </span>
          </div>
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-[#2a274e]/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[#2a274e]/60 dark:bg-white/[0.06] dark:text-white/60">
              Coming soon
            </span>
          </span>
        </div>
      </div>
    </Card>
  );
}
