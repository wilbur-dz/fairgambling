import { CoinIcon } from "@/components/ui/coin-icon";
import { dedupeChains, dropNonAssets } from "@/lib/crypto/icons";

function SupportedCard({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-1 flex-col gap-1.5 rounded-[24px] border-[0.5px] border-[#2a274e]/[0.12] bg-white/[0.5] p-4 dark:border-white/20 dark:bg-white/[0.01]">
      <span className="text-[11px] uppercase leading-none text-[rgba(42,39,78,0.45)] dark:text-white/40">
        {label}
      </span>
      <span className="text-[20px] font-semibold leading-none text-[#2a274e] dark:text-white">
        {items.length}
      </span>
      <div className="scrollbar-hide flex flex-nowrap items-center overflow-x-auto md:flex-wrap md:overflow-visible">
        {items.map((item) => (
          <span
            key={item}
            className="-ml-1 shrink-0 rounded-full ring-1 ring-white first:ml-0 dark:ring-[#0f1424]"
          >
            <CoinIcon coin={item} size={18} />
          </span>
        ))}
      </div>
    </div>
  );
}

type SupportedCardsProps = {
  chains: string[];
  coins: string[];
};

/** Port of reference `SupportedCards` (482547). */
export function SupportedCards({ chains, coins }: SupportedCardsProps) {
  const chainItems = dedupeChains(chains);
  const coinItems = dropNonAssets(coins);
  if (chainItems.length === 0 && coinItems.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <SupportedCard label="Supported Chains" items={chainItems} />
      <SupportedCard label="Supported Coins" items={coinItems} />
    </div>
  );
}
