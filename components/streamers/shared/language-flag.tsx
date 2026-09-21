"use client";

import { flagUrl, resolveLanguage } from "@/lib/streamers/locale";

type LanguageFlagProps = {
  lang: string | null | undefined;
  title?: string;
};

export function LanguageFlag({ lang, title }: LanguageFlagProps) {
  const resolved = resolveLanguage(lang);
  if (!resolved) {
    return <span className="text-[rgba(42,39,78,0.25)] dark:text-white/25">—</span>;
  }
  return (
    <span
      title={title ?? resolved.name}
      className="inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full"
    >
      <img
        src={flagUrl(resolved.cc)}
        alt={resolved.name}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </span>
  );
}
