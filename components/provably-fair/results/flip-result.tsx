"use client";

export function FlipResult({
  outcomes,
}: {
  outcomes: ("heads" | "tails")[];
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <p className="text-[13px] font-medium uppercase tracking-wide text-[rgba(42,39,78,0.45)] dark:text-white/40">
        Coin Flips
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {outcomes.map((o, i) => (
          <div
            key={i}
            className={`flex h-14 w-14 flex-col items-center justify-center rounded-full text-[12px] font-semibold ${
              o === "heads"
                ? "bg-[#8874ff] text-white"
                : "bg-[rgba(42,39,78,0.1)] text-[#2a274e] dark:bg-white/10 dark:text-white"
            }`}
          >
            <span className="text-[10px] opacity-70">#{i + 1}</span>
            {o === "heads" ? "H" : "T"}
          </div>
        ))}
      </div>
      <p className="text-[13px] capitalize text-[rgba(42,39,78,0.5)] dark:text-white/45">
        {outcomes.join(" · ")}
      </p>
    </div>
  );
}
