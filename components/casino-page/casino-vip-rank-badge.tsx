const RANK_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#96ABB4",
  gold: "#E0A710",
  platinum: "#7CB9E8",
  diamond: "#B9F2FF",
  pearl: "#EAE0C8",
  obsidian: "#9370DB",
};

function rankColor(rank: string): string {
  const key = rank
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+(i{1,3}v?|v|vi{0,3}|\d+)$/i, "");
  return RANK_COLORS[key] ?? "#96ABB4";
}

/** Port of reference VIP rank badge `v` (3gytcvcyv09c7.js). */
export function CasinoVipRankBadge({ rank }: { rank: string }) {
  const color = rankColor(rank);
  return (
    <div className="inline-flex items-center gap-1">
      <svg
        width="16"
        height="16"
        viewBox="0 0 32 32"
        fill="none"
        className="shrink-0"
        aria-hidden
      >
        <path
          d="M25.3334 12.0013C25.3334 17.156 21.1547 21.3346 16.0001 21.3346C10.8454 21.3346 6.66675 17.156 6.66675 12.0013C6.66675 6.84665 10.8454 2.66797 16.0001 2.66797C21.1547 2.66797 25.3334 6.84665 25.3334 12.0013Z"
          fill={color}
        />
        <path
          d="M9.45735 21.2539L8.95232 23.096C8.11453 26.1518 7.69564 27.6796 8.25463 28.5162C8.45053 28.8092 8.71333 29.0446 9.01829 29.1998C9.88845 29.6428 11.232 28.9428 13.9191 27.5427C14.8132 27.0768 15.2603 26.8439 15.7352 26.7932C15.9113 26.7744 16.0887 26.7744 16.2648 26.7932C16.7397 26.8439 17.1868 27.0768 18.0809 27.5427C20.768 28.9428 22.1116 29.6428 22.9817 29.1998C23.2867 29.0446 23.5495 28.8092 23.7453 28.5162C24.3044 27.6796 23.8855 26.1518 23.0477 23.096L22.5427 21.2539C20.6944 22.5628 18.4371 23.332 16 23.332C13.5629 23.332 11.3055 22.5628 9.45735 21.2539Z"
          fill={color}
        />
      </svg>
      <span className="text-[11px] font-medium" style={{ color }}>
        {rank}
      </span>
    </div>
  );
}
