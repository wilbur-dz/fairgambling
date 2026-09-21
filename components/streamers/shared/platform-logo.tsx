"use client";

type PlatformLogoProps = {
  platform: string;
  height?: number;
  className?: string;
};

export function PlatformLogo({
  platform,
  height = 12,
  className = "",
}: PlatformLogoProps) {
  if ((platform || "").toLowerCase() === "kick") {
    return (
      <img
        src="/logos/platforms/kick.svg"
        alt="Kick"
        style={{ height }}
        className={`w-auto shrink-0 ${className}`}
      />
    );
  }
  return <span>{platform}</span>;
}
