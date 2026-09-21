"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export function StreamerSearchInput({
  onQuery,
}: {
  onQuery: (query: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="relative w-full max-w-[340px]">
      <Search
        size={15}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgba(42,39,78,0.4)] dark:text-white/35"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onQuery(e.target.value);
        }}
        placeholder="Search streamers…"
        className="w-full rounded-full border border-[rgba(42,39,78,0.1)] bg-white/[0.5] py-2.5 pl-10 pr-3.5 text-[13px] text-[#2a274e] outline-none placeholder:text-[rgba(42,39,78,0.3)] focus:border-[#8874ff]/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/30"
      />
    </div>
  );
}
