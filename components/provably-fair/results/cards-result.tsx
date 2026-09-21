"use client";

function suitColor(card: string): string {
  if (card.startsWith("♦") || card.startsWith("♥")) return "#ef4444";
  return "#2a274e";
}

export function CardsResult({
  cards,
  label = "Cards",
}: {
  cards: string[];
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <p className="text-[13px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.45)] dark:text-white/40">
        {label}
      </p>
      <div className="flex max-h-[320px] flex-wrap justify-center gap-2 overflow-y-auto px-2">
        {cards.map((card, i) => (
          <div
            key={`${card}-${i}`}
            className="flex h-14 w-10 flex-col items-center justify-center rounded-[8px] border border-[rgba(42,39,78,0.12)] bg-white text-[13px] font-semibold shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            style={{ color: suitColor(card) }}
            title={`#${i + 1}`}
          >
            {card}
          </div>
        ))}
      </div>
      <p className="text-[12px] text-[rgba(42,39,78,0.45)] dark:text-white/40">
        {cards.length} cards
      </p>
    </div>
  );
}
