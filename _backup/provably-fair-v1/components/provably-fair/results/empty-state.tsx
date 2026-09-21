"use client";

export function EmptyState({
  message = "Enter your client seed and server seed to verify the result.",
}: {
  message?: string;
}) {
  return (
    <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#8874ff]/15 text-[#8874ff]">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M12 12V21" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 12L20 7.5M12 12L4 7.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
      <p className="max-w-[280px] text-[14px] leading-relaxed text-[rgba(42,39,78,0.55)] dark:text-white/50">
        {message}
      </p>
    </div>
  );
}
