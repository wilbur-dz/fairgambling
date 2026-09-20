function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const raw = hex.replace("#", "");
  return {
    r: parseInt(raw.substring(0, 2), 16),
    g: parseInt(raw.substring(2, 4), 16),
    b: parseInt(raw.substring(4, 6), 16),
  };
}

function lerpColor(from: string, to: string, t: number): string {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

/** Port of reference `getTotalScoreColor` (0–100 trust score → gauge stroke). */
export function getTotalScoreColor(score: number): string {
  if (!Number.isFinite(score)) return "rgb(251, 55, 72)";
  if (score >= 75) return lerpColor("#5CB85C", "#1FC16B", (score - 75) / 25);
  if (score >= 50) return lerpColor("#F6B51E", "#5CB85C", (score - 50) / 25);
  if (score >= 25) return lerpColor("#F07B3F", "#F6B51E", (score - 25) / 25);
  return lerpColor("#FB3748", "#F07B3F", score / 25);
}

export function getCategoryScoreColor(scoreOutOf10: number): string {
  return getTotalScoreColor(10 * scoreOutOf10);
}
