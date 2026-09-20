/**
 * Theme class helper from reference `themed(theme, light, dark)`.
 *
 * Important: pass **literal** `dark:…` class names in `darkClasses` so Tailwind’s
 * scanner can emit them (e.g. `dark:hover:text-white/80`). Do not rely on
 * runtime `dark:` prefixing — those utilities will be missing from CSS.
 *
 * Example:
 *   themed("auto", "text-[#2a274e] hover:text-black", "dark:text-white/50 dark:hover:text-white/80")
 */
export function themed(
  theme: "auto" | "light" | "dark",
  lightClasses: string,
  darkClasses: string,
): string {
  if (theme === "light") return lightClasses.trim();
  if (theme === "dark") {
    return darkClasses
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((cls) => (cls.startsWith("dark:") ? cls.slice("dark:".length) : cls))
      .join(" ");
  }
  return `${lightClasses.trim()} ${darkClasses.trim()}`.trim();
}
