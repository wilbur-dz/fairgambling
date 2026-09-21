export function formatUsd(n: number, digits = 2) {
  if (!Number.isFinite(n)) return "$0.00";
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function formatUsdCompact(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function formatCount(n: number) {
  return (n ?? 0).toLocaleString("en-US");
}

export function formatPct(n: number, digits = 2) {
  return `${(n ?? 0).toFixed(digits)}%`;
}

export function pnlTone(n: number, light = true) {
  if (n > 0) return light ? "text-[#1f9d57]" : "text-[#4ADE80]";
  if (n < 0) return light ? "text-[#dc2626]" : "text-[#F87171]";
  return light
    ? "text-[rgba(42,39,78,0.7)]"
    : "text-white/70";
}

/** Auto theme P&L text classes. */
export function pnlClass(n: number) {
  if (n > 0) return "text-[#1f9d57] dark:text-[#4ADE80]";
  if (n < 0) return "text-[#dc2626] dark:text-[#F87171]";
  return "text-[rgba(42,39,78,0.7)] dark:text-white/70";
}

export function dayKey(ms: number) {
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
}

export function hourKey(ms: number) {
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? "" : `${d.toISOString().slice(0, 13)}:00`;
}

export function minuteKey(ms: number) {
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 16);
}

export function titleCaseGame(name: string) {
  if (!name) return name;
  if (/[a-z]/.test(name) && /[A-Z]/.test(name)) return name;
  return name.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
}
