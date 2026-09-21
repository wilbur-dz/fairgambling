const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatCountdown(
  targetMs: number,
  nowMs: number,
  opts?: { upper?: boolean },
) {
  const diff = targetMs - nowMs;
  if (diff <= 0) {
    const zero = "0d 0h 0m";
    return opts?.upper ? zero.toUpperCase() : zero;
  }
  const days = Math.floor(diff / 864e5);
  const hours = Math.floor((diff % 864e5) / 36e5);
  const minutes = Math.floor((diff % 36e5) / 6e4);
  const label = `${days}d ${hours}h ${minutes}m`;
  return opts?.upper ? label.toUpperCase() : label;
}

export function formatDateLabel(ms: number) {
  const d = new Date(ms);
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatDateNumeric(ms: number) {
  const d = new Date(ms);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${d.getUTCFullYear()}`;
}

export function formatMonthYear(year: number, month0: number) {
  return `${MONTHS_LONG[month0]} ${year}`;
}

export function formatUsd(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function formatTimeUtc(ms: number, hasFixedTime: boolean) {
  if (!hasFixedTime) return null;
  const d = new Date(ms);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m} UTC`;
}
