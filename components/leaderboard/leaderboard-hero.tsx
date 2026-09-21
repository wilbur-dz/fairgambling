"use client";

import { Link2, UserPlus } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { Button } from "@/components/ui/button";

/** Page hero — prize headline + auth CTA. */
export function LeaderboardHero() {
  const { isAuthenticated } = useAuth();
  const { openRegisterModal } = useAuthModal();

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-[#2a274e] sm:text-4xl lg:text-5xl dark:text-white">
        <span className="text-[#8874ff]">$10,000</span> Leaderboard
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-[rgba(42,39,78,0.55)] sm:text-base dark:text-white/50">
        Compete across all partnered casinos for weekly rewards. The more you
        wager, the higher you climb.
      </p>
      <div className="mt-4 flex justify-center">
        {isAuthenticated ? (
          <Button
            variant="primary"
            size="md"
            leftIcon={<Link2 />}
            className="w-full sm:w-auto"
            onClick={() => {
              window.location.href = "/affiliate";
            }}
          >
            Connect More Casino Accounts
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            leftIcon={<UserPlus />}
            className="w-full sm:w-auto"
            onClick={openRegisterModal}
          >
            Sign Up & Connect Your Accounts
          </Button>
        )}
      </div>
    </div>
  );
}
