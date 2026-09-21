"use client";

import { NumberStepper } from "@/components/bonus-calculator/field";
import type { SeedInputs } from "@/lib/provably-fair/types";

function RequiredLabel({ label }: { label: string }) {
  return (
    <span className="font-medium leading-none text-[#2a274e] dark:text-white">
      {label}{" "}
      <span className="text-[#8874ff]" aria-hidden>
        *
      </span>
    </span>
  );
}

type SeedFieldsProps = {
  seeds: SeedInputs;
  onChange: (next: SeedInputs) => void;
  showNonce?: boolean;
};

export function SeedFields({
  seeds,
  onChange,
  showNonce = true,
}: SeedFieldsProps) {
  const inputClass =
    "h-[42px] w-full rounded-[22px] border border-[rgba(42,39,78,0.15)] bg-white px-4 text-[14px] font-light text-[#2a274e] outline-none placeholder:text-[rgba(42,39,78,0.5)] dark:border-white/10 dark:bg-white/[0.02] dark:text-white dark:placeholder:text-white/50";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full flex-col gap-2">
        <RequiredLabel label="Client Seed" />
        <input
          type="text"
          value={seeds.clientSeed}
          onChange={(e) => onChange({ ...seeds, clientSeed: e.target.value })}
          placeholder="Enter client seed..."
          className={inputClass}
        />
      </div>
      <div className="flex w-full flex-col gap-2">
        <RequiredLabel label="Server Seed (Unhashed)" />
        <input
          type="text"
          value={seeds.serverSeed}
          onChange={(e) => onChange({ ...seeds, serverSeed: e.target.value })}
          placeholder="Enter server seed..."
          className={inputClass}
        />
      </div>
      {showNonce ? (
        <div className="flex w-full flex-col gap-2">
          <RequiredLabel label="Nonce" />
          <NumberStepper
            value={String(seeds.nonce)}
            onChange={(v) =>
              onChange({
                ...seeds,
                nonce: Math.max(0, Math.floor(parseFloat(v) || 0)),
              })
            }
            ariaLabel="Nonce"
            step={1}
          />
        </div>
      ) : null}
    </div>
  );
}
