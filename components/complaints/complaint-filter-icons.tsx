import type { LucideIcon } from "lucide-react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BadgeCheck,
  Circle,
  CircleHelp,
  Gift,
  IdCard,
  LayoutGrid,
  Lock,
  ShieldAlert,
  Store,
  Trophy,
  Users,
} from "lucide-react";
import {
  complaintStatusMeta,
  isAllFilterValue,
} from "@/lib/complaints/display";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  deposit: ArrowDownToLine,
  withdrawal: ArrowUpFromLine,
  bonus: Gift,
  responsible_gambling: ShieldAlert,
  kyc: IdCard,
  account_restricted: Lock,
  provably_fair: BadgeCheck,
  affiliate: Users,
  sports: Trophy,
  other: CircleHelp,
};

export function complaintAllCategoriesIcon(size = 18) {
  return (
    <LayoutGrid
      size={size}
      className="shrink-0 text-[rgba(42,39,78,0.4)] dark:text-white/40"
    />
  );
}

/** Reference `allIcon` for the All Casinos dropdown. */
export function complaintAllCasinosIcon(size = 18) {
  return (
    <Store
      size={size}
      className="shrink-0 text-[rgba(42,39,78,0.4)] dark:text-white/40"
    />
  );
}

export function complaintCategoryIcon(value: string, size = 18) {
  if (isAllFilterValue(value)) {
    return complaintAllCategoriesIcon(size);
  }
  const Icon = CATEGORY_ICONS[value] ?? LayoutGrid;
  return <Icon size={size} className="shrink-0 text-[#8874ff]" />;
}

export function complaintStatusIcon(value: string, size = 18) {
  if (isAllFilterValue(value)) {
    return (
      <Circle
        size={size}
        className="shrink-0 text-[rgba(42,39,78,0.4)] dark:text-white/40"
      />
    );
  }
  const meta = complaintStatusMeta(value);
  return (
    <span
      className="inline-block size-[10px] shrink-0 rounded-full"
      style={{ backgroundColor: meta.color }}
      aria-hidden
    />
  );
}
