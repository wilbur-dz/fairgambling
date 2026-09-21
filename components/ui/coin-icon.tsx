import Image from "next/image";
import { getCryptoIconPath } from "@/lib/crypto/icons";

const FIAT_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  TRY: "₺",
};

type CoinIconProps = {
  coin: string;
  size?: number;
  className?: string;
};

/** Port of reference `CoinIcon` (225435). */
export function CoinIcon({ coin, size = 20, className = "" }: CoinIconProps) {
  const src = getCryptoIconPath(coin);
  if (src) {
    return (
      <Image
        src={src}
        alt={coin}
        width={size}
        height={size}
        className={`shrink-0 rounded-full ${className}`}
      />
    );
  }

  const fallback =
    FIAT_SYMBOLS[coin.toUpperCase()] ?? coin.charAt(0).toUpperCase();

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[rgba(42,39,78,0.08)] font-semibold text-[#2a274e] dark:bg-white/[0.06] dark:text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      aria-hidden
    >
      {fallback}
    </span>
  );
}
