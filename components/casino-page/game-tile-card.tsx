import { Card } from "@/components/ui/card";

type GameTileCardProps = {
  thumbnail?: string | null;
  name: string;
  rtp: number | null;
  sub?: string | null;
  stackOnMobile?: boolean;
};

function rtpColor(rtp: number | null): string {
  if (rtp == null) return "var(--nd-ink)";
  if (rtp >= 99) return "var(--nd-profit)";
  if (rtp >= 96) return "var(--nd-warn)";
  return "var(--nd-loss)";
}

/** Port of reference house/slot tile `m` (2-7hhq-z71oqb.js). */
export function GameTileCard({
  thumbnail,
  name,
  rtp,
  sub,
  stackOnMobile = false,
}: GameTileCardProps) {
  const mutedClass = "text-[rgba(42,39,78,0.45)] dark:text-white/30";
  const thumbClass = stackOnMobile
    ? "h-[96px] w-full md:h-[79px] md:w-[60px]"
    : "h-[79px] w-[60px]";

  return (
    <Card
      variant="glass"
      padded={false}
      className="p-2.5"
      contentClassName={
        stackOnMobile
          ? "flex flex-col gap-2.5 md:flex-row md:items-start"
          : "flex items-start gap-2.5"
      }
    >
      {thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element -- CDN thumbnails
        <img
          src={thumbnail}
          alt={name}
          loading="lazy"
          className={`shrink-0 rounded-[10px] object-cover ${thumbClass}`}
        />
      ) : (
        <div
          className={`shrink-0 rounded-[10px] bg-[rgba(42,39,78,0.05)] dark:bg-white/[0.04] ${thumbClass}`}
        />
      )}

      <div
        className={`flex min-w-0 flex-1 flex-col ${
          stackOnMobile ? "gap-2 md:gap-4" : "gap-4"
        }`}
      >
        <span className="w-full truncate text-[16px] font-medium text-[#2a274e] dark:text-white">
          {name}
        </span>
        <div className="flex w-full flex-col gap-1.5 text-[14px]">
          <div className="flex items-center justify-between">
            <span className={mutedClass}>RTP</span>
            {rtp != null ? (
              <span
                className="text-right font-medium"
                style={{ color: rtpColor(rtp) }}
              >
                {rtp}%
              </span>
            ) : null}
          </div>
          {sub ? (
            <span className={`w-full truncate ${mutedClass}`}>{sub}</span>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
