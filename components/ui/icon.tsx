import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Building2,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Dices,
  Gem,
  Globe,
  Goal,
  Home,
  LogOut,
  Medal,
  MessageSquareWarning,
  PanelLeft,
  PieChart,
  Radio,
  Search,
  Star,
  Ticket,
  Trophy,
  User,
  Wrench,
} from "lucide-react";
import type { NavIconName } from "@/lib/navigation";

type IconName = NavIconName | "chevron-down" | "search-icon" | "logout-icon";

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
};

const DiscordGlyph = ({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515.07.07 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.3 18.3 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.25.08.08 0 0 0-.079-.037A19.7 19.7 0 0 0 3.677 4.37a.09.09 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.08.08 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.08.08 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.07.07 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.07.07 0 0 1 .079.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.08.08 0 0 0 .084.028 19.8 19.8 0 0 0 6.002-3.03.08.08 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const XGlyph = ({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);

const TelegramGlyph = ({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.5.5 0 0 1 .171.325c.016.093.036.458.02.889-.16 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const RedditGlyph = ({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden
  >
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.1 3.1 0 0 1 .042.52c0 2.769-3.209 5.002-7.14 5.002-3.932 0-7.141-2.233-7.141-5.002 0-.175.014-.349.042-.52-.575-.281-1.01-.898-1.01-1.614 0-.968.786-1.754 1.754-1.754.463 0 .898.183 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.561-1.249-1.249-1.249zm-5.038 3.519c-.082.084.223.411.715.67.491.26 1.146.39 1.573.39.427 0 1.081-.13 1.572-.39.491-.259.798-.586.715-.67-.082-.084-.223-.311-.715-.39-.492-.078-1.145-.078-1.572-.078-.428 0-1.081 0-1.573.078-.491.079-.797.306-.715.39z" />
  </svg>
);

const LUCIDE_MAP: Partial<Record<IconName, LucideIcon>> = {
  "home-icon": Home,
  "podium-icon": Trophy,
  "analytics-icon": BarChart3,
  "reviews-icon": Star,
  "complaints-icon": MessageSquareWarning,
  "streamers-icon": Radio,
  "activity-icon": Activity,
  "user-icon": User,
  "medal-icon": Medal,
  "code-bonuses-icon": Ticket,
  "diamond-icon": Gem,
  "bonus-tools-icon": Wrench,
  "calculator-icon": Calculator,
  "calendar-icon": CalendarDays,
  "football-icon": Goal,
  "globe-icon": Globe,
  "check-icon": CheckCircle2,
  "casino-icon": Dices,
  "pie-chart-icon": PieChart,
  "casino-building-icon": Building2,
  "sidebar-toggle-icon": PanelLeft,
  "chevron-down": ChevronDown,
  "search-icon": Search,
  "logout-icon": LogOut,
};

export function Icon({ name, size = 18, className }: IconProps) {
  if (name === "discord-icon") {
    return <DiscordGlyph size={size} className={className} />;
  }
  if (name === "x-icon") {
    return <XGlyph size={size} className={className} />;
  }
  if (name === "telegram-icon") {
    return <TelegramGlyph size={size} className={className} />;
  }
  if (name === "reddit-icon") {
    return <RedditGlyph size={size} className={className} />;
  }

  const Lucide = LUCIDE_MAP[name];
  if (!Lucide) return null;

  return <Lucide size={size} className={`shrink-0 ${className ?? ""}`} />;
}
