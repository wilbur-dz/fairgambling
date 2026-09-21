"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";

const FROM_MAP: Record<string, { href: string; label: string }> = {
  reviews: { href: "/reviews", label: "Reviews" },
  casinos: { href: "/casinos", label: "Casinos" },
};

/** Port of reference `CasinoBackLink`. */
export function CasinoBackLink() {
  const from = useSearchParams().get("from");
  const target = from ? FROM_MAP[from] : null;
  if (!target) return null;

  return (
    <Link
      href={target.href}
      prefetch={false}
      className="inline-flex w-fit items-center gap-1.5 text-[14px] opacity-60 transition-opacity hover:opacity-100"
    >
      <ChevronLeft size={16} />
      Back to {target.label}
    </Link>
  );
}
