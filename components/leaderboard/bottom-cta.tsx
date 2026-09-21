"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Link2, Trophy, UserPlus } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { BrandMark } from "@/components/ui/brand-mark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function FeatureChip({
  icon: Icon,
  label,
}: {
  icon: typeof UserPlus;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon size={12} className="shrink-0 text-[#6b56e0] dark:text-[#8874ff]" />
      <span className="text-[12px] text-[rgba(42,39,78,0.55)] dark:text-white/50">
        {label}
      </span>
    </span>
  );
}

/** Bottom CTA banner — auth-aware copy for joining / connecting. */
export function LeaderboardBottomCta() {
  const { user } = useAuth();
  const { openRegisterModal } = useAuthModal();
  const router = useRouter();

  return (
    <Card
      variant="panel"
      blur
      padded={false}
      className="relative overflow-hidden p-5 sm:p-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 bg-[radial-gradient(ellipse_at_center_bottom,rgba(209,213,219,0.25)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center_bottom,rgba(136,116,255,0.25)_0%,transparent_70%)]"
        style={{ width: 500, height: 300, filter: "blur(60px)" }}
      />
      <div className="relative z-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
        <span className="flex size-[52px] shrink-0 items-center justify-center rounded-[14px] border border-[rgba(42,39,78,0.1)] bg-white/[0.5] sm:size-[60px] dark:border-white/[0.06] dark:bg-[rgba(7,5,22,0.3)]">
          <BrandMark size={28} />
        </span>

        <div className="min-w-0 flex-1">
          {user ? (
            <>
              <h3 className="text-lg font-semibold leading-tight text-[#2a274e] sm:text-xl dark:text-white">
                Connect more casinos
              </h3>
              <p className="mt-1 text-[13px] text-[rgba(42,39,78,0.6)] dark:text-white/60">
                Link additional accounts to increase your total wager and climb
                the ranks
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
                <FeatureChip icon={Link2} label="Multi-Casino Tracking" />
                <FeatureChip icon={Trophy} label="Combined Wager Score" />
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold leading-tight text-[#2a274e] sm:text-xl dark:text-white">
                Join the leaderboard
              </h3>
              <p className="mt-1 text-[13px] text-[rgba(42,39,78,0.6)] dark:text-white/60">
                Sign up, play under our code, and compete for weekly rewards
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
                <FeatureChip icon={UserPlus} label="Free to Join" />
                <FeatureChip icon={Trophy} label="Cross-Casino Rewards" />
              </div>
            </>
          )}
        </div>

        <Button
          theme="auto"
          variant="ghost"
          size="md"
          rightIcon={<ArrowRight />}
          className="w-full shrink-0 justify-center sm:w-auto"
          onClick={() => {
            if (user) router.push("/profile");
            else openRegisterModal();
          }}
        >
          {user ? "Go to Profile" : "Get Started"}
        </Button>
      </div>
    </Card>
  );
}
