"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Search, Sun } from "lucide-react";
import {
  createElement,
  useState,
  type ReactNode,
} from "react";
import { HeaderAuthDialogs } from "@/components/auth/auth-flow-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { useAuthModal } from "@/components/auth/auth-modal-provider";
import { NotificationBell } from "@/components/header/notification-bell";
import { UserMenu } from "@/components/header/user-menu";
import { useSearch } from "@/components/search/search-provider";
import { useTheme } from "@/components/theme/theme-provider";
import { BrandMark } from "@/components/ui/brand-mark";
import { Button } from "@/components/ui/button";
import { getPageTitle, isComplaintsEnabled } from "@/lib/navigation";

const TITLE_CLASS =
  "text-2xl font-semibold text-[#2a274e] dark:text-white";

const ICON_SIZE_CONFIG = {
  paddingX: 11,
  paddingY: 11,
  gap: 0,
  iconSize: 20,
  radius: 999,
} as const;

function HeaderSearchButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      theme="auto"
      aria-label="Search"
      onClick={onClick}
      sizeConfig={ICON_SIZE_CONFIG}
      className="shrink-0"
      leftIcon={<Search className="text-[#8874ff] dark:text-white" />}
    />
  );
}

function HeaderThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <Button
      variant="ghost"
      theme="auto"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title="Toggle theme"
      onClick={toggleTheme}
      sizeConfig={ICON_SIZE_CONFIG}
      className="shrink-0"
      leftIcon={<Icon className="text-[#8874ff] dark:text-white" />}
    />
  );
}

type SiteHeaderProps = {
  title?: string;
  mobileAction?: ReactNode;
  titleAs?: "h1" | "p" | "div" | "span";
};

export function SiteHeader({
  title: titleProp,
  mobileAction,
  titleAs = "h1",
}: SiteHeaderProps) {
  const pathname = usePathname();
  const title = titleProp ?? getPageTitle(pathname);
  const asHeading = titleAs === "h1";
  const {
    user,
    isAuthenticated,
    isLoading,
    logout,
  } = useAuth();
  const { openLoginModal, openRegisterModal } = useAuthModal();
  const { openSearch } = useSearch();
  const complaintsEnabled = isComplaintsEnabled();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const onLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const signedIn = isAuthenticated && user;

  const desktopAuthButtons = (
    <>
      <Button
        variant="ghost"
        theme="auto"
        className="h-[42px] w-[120px] justify-center"
        onClick={openLoginModal}
      >
        Login
      </Button>
      <Button
        variant="primary"
        className="h-[42px] w-[120px] justify-center"
        onClick={openRegisterModal}
      >
        Register
      </Button>
    </>
  );

  const mobileAuthButtons = (
    <>
      <Button
        variant="ghost"
        theme="auto"
        size="sm"
        onClick={openLoginModal}
      >
        Login
      </Button>
      <Button variant="primary" size="sm" onClick={openRegisterModal}>
        Register
      </Button>
    </>
  );

  return (
    <header>
      <div className="hidden items-center justify-between gap-4 px-6 pt-6 md:flex">
        <p
          className={TITLE_CLASS}
          role={asHeading ? "heading" : undefined}
          aria-level={asHeading ? 1 : undefined}
        >
          {title}
        </p>
        <div className="flex items-center gap-4">
          <HeaderThemeToggle />
          <HeaderSearchButton onClick={openSearch} />
          <NotificationBell theme="auto" />
          {isLoading ? (
            <>
              <div
                className="fg-auth-only flex items-center gap-4"
                aria-hidden="true"
              >
                {complaintsEnabled ? (
                  <div className="h-[44px] w-[44px] animate-pulse rounded-[10px] bg-white/[0.06]" />
                ) : null}
                <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.06]" />
              </div>
              <div className="fg-anon-only flex items-center gap-4">
                {desktopAuthButtons}
              </div>
            </>
          ) : signedIn ? (
            <UserMenu isLoggingOut={isLoggingOut} onLogout={onLogout} />
          ) : (
            desktopAuthButtons
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 md:hidden">
        <div className="flex items-center justify-between gap-4 px-4 pt-[calc(env(safe-area-inset-top)_+_1.75rem)]">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="Home" className="flex items-center">
              <BrandMark priority />
            </Link>
            <HeaderSearchButton onClick={openSearch} />
          </div>
          <div className="flex items-center gap-2">
            <HeaderThemeToggle />
            {isLoading ? (
              <>
                <div
                  className="fg-auth-only h-10 w-10 animate-pulse rounded-full bg-white/[0.06]"
                  aria-hidden="true"
                />
                <div className="fg-anon-only flex items-center gap-2">
                  {mobileAuthButtons}
                </div>
              </>
            ) : signedIn ? (
              <UserMenu isLoggingOut={isLoggingOut} onLogout={onLogout} />
            ) : (
              mobileAuthButtons
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 px-4">
          {createElement(titleAs, { className: TITLE_CLASS }, title)}
          {mobileAction}
        </div>
      </div>

      <HeaderAuthDialogs />
    </header>
  );
}
