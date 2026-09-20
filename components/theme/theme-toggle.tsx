"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <Button
      variant="ghost"
      theme="auto"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title="Toggle theme"
      onClick={toggleTheme}
      sizeConfig={{
        paddingX: 11,
        paddingY: 11,
        gap: 0,
        iconSize: 20,
        radius: 999,
      }}
      className={`shrink-0 ${className}`}
      leftIcon={<Icon className="text-[#8874ff] dark:text-white" />}
    />
  );
}
