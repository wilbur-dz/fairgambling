"use client";

import { useEffect, useState } from "react";

const svgCache = new Map<string, string>();
const svgInflight = new Map<string, Promise<string>>();

function sanitizeSvgMarkup(raw: string): string {
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+\s*=/gi, " data-removed=");
}

async function loadCasinoGameSvg(name: string): Promise<string> {
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    return "";
  }
  if (svgCache.has(name)) {
    return svgCache.get(name) ?? "";
  }
  if (svgInflight.has(name)) {
    return svgInflight.get(name)!;
  }

  const promise = fetch(`/casino-games/${name}.svg`)
    .then((res) => (res.ok ? res.text() : ""))
    .then((text) => {
      const sanitized = text ? sanitizeSvgMarkup(text) : "";
      svgCache.set(name, sanitized);
      svgInflight.delete(name);
      return sanitized;
    })
    .catch(() => {
      svgCache.set(name, "");
      svgInflight.delete(name);
      return "";
    });

  svgInflight.set(name, promise);
  return promise;
}

type CasinoGameIconProps = {
  name: string;
  size?: number;
  className?: string;
  fill?: boolean;
};

/** Port of reference inline SVG loader `c` (2-7hhq-z71oqb.js). */
export function CasinoGameIcon({
  name,
  size = 20,
  className = "",
  fill = false,
}: CasinoGameIconProps) {
  const [markup, setMarkup] = useState(() => svgCache.get(name) ?? "");

  useEffect(() => {
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) return;
    if (svgCache.has(name)) {
      setMarkup(svgCache.get(name) ?? "");
      return;
    }

    void loadCasinoGameSvg(name).then(setMarkup);
  }, [name]);

  const style = fill ? undefined : { width: size, aspectRatio: "2/3" as const };

  if (markup) {
    return (
      <div
        className={`inline-flex shrink-0 items-center justify-center ${
          fill ? "[&>svg]:h-full [&>svg]:w-full" : ""
        } ${className}`}
        style={style}
        aria-hidden
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    );
  }

  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      style={style}
      aria-hidden
    />
  );
}
