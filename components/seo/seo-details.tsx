import Link from "next/link";
import type { ReactNode } from "react";
import { CollapseBottomButton } from "@/components/ui/collapse-bottom-button";

const DETAILS_CLASS =
  "group rounded-[18px] border border-base-200 px-4 py-4 open:pb-6 sm:px-6 sm:py-5 dark:border-base-700";

const HEADING_CLASS =
  "text-lg font-semibold text-base-900 sm:text-xl dark:text-base-050";

const CHEVRON_CLASS =
  "shrink-0 text-base-500 transition-transform group-open:rotate-180 dark:text-base-400";

/** Approximate reference `prose` styles without @tailwindcss/typography. */
const PROSE_CLASS =
  "mt-4 max-w-none space-y-3 [&_a]:text-[#4F2DEC] dark:[&_a]:text-[#7C5EFF] [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h1]:text-base-900 [&_h2]:text-base-900 [&_h3]:text-base-900 dark:[&_h1]:text-base-050 dark:[&_h2]:text-base-050 dark:[&_h3]:text-base-050 [&_li]:text-[13px] sm:[&_li]:text-base [&_p]:text-[13px] [&_p]:text-base-700 sm:[&_p]:text-base dark:[&_p]:text-base-300 [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[13px] sm:[&_table]:text-base [&_th]:border [&_th]:border-base-200 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold dark:[&_th]:border-base-700 [&_td]:border [&_td]:border-base-200 [&_td]:px-2 [&_td]:py-1.5 dark:[&_td]:border-base-700";


export type SeoPostItem = {
  id: string;
  slug: string;
  title: string;
};

export type SeoPostsDetailsProps = {
  heading: string;
  items: SeoPostItem[];
};

export type SeoProseDetailsProps = {
  heading: string;
  html: string;
};

function DetailsShell({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <details className={DETAILS_CLASS}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <h2 className={HEADING_CLASS}>{heading}</h2>
        <span aria-hidden className={CHEVRON_CLASS}>
          ▾
        </span>
      </summary>
      {children}
      <CollapseBottomButton label="Hide" />
    </details>
  );
}

/** Port of reference `SeoPostsDetails` — collapsible related blog links. */
export function SeoPostsDetails({ heading, items }: SeoPostsDetailsProps) {
  if (typeof heading !== "string" || !heading.trim()) return null;
  if (!Array.isArray(items) || items.length === 0) return null;

  const safeItems = items.filter(
    (item): item is SeoPostItem =>
      item != null &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      item.id.length > 0 &&
      typeof item.slug === "string" &&
      /^[a-z0-9-]+$/i.test(item.slug) &&
      typeof item.title === "string" &&
      item.title.length > 0,
  );
  if (safeItems.length === 0) return null;

  return (
    <DetailsShell heading={heading.trim()}>
      <ul className="mt-4 space-y-2">
        {safeItems.map((item) => (
          <li key={item.id}>
            <Link
              href={`/blog/${item.slug}`}
              className="text-sm text-[#4F2DEC] hover:underline sm:text-base dark:text-[#7C5EFF]"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </DetailsShell>
  );
}

/** Port of reference `SeoProseDetails` — collapsible CMS HTML block. */
export function SeoProseDetails({ heading, html }: SeoProseDetailsProps) {
  if (typeof heading !== "string" || !heading.trim()) return null;
  if (typeof html !== "string" || !html.trim()) return null;

  return (
    <DetailsShell heading={heading.trim()}>
      <div
        className={PROSE_CLASS}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </DetailsShell>
  );
}
