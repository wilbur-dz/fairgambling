"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, MessageCircle } from "lucide-react";
import { displayEmail, useAuth } from "@/components/auth/auth-provider";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { isComplaintsEnabled } from "@/lib/navigation";

type UserMenuProps = {
  isLoggingOut: boolean;
  onLogout: () => void;
};

export function UserMenu({ isLoggingOut, onLogout }: UserMenuProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!user) return null;

  const email = displayEmail(user.email);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center transition-opacity duration-150 hover:opacity-80 focus:outline-none"
        aria-label="User menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Avatar
          src={user.avatarUrl}
          username={user.username}
          email={user.email}
          size={40}
        />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-base-200 bg-white py-1 shadow-lg dark:border-base-700 dark:bg-[#161c32]">
          <div className="border-b border-base-200 px-4 py-3 dark:border-base-700">
            <p className="truncate text-sm font-medium text-base-900 dark:text-white">
              {user.username || "Anonymous"}
            </p>
            {email ? (
              <p className="truncate text-xs text-base-500 dark:text-base-400">
                {email}
              </p>
            ) : null}
          </div>
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-base-700 transition-colors hover:bg-base-100 dark:text-base-200 dark:hover:bg-white/5"
            >
              <Icon name="user-icon" size={16} className="text-base-400" />
              Profile
            </Link>
            {isComplaintsEnabled() ? (
              <Link
                href="/complaints"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-base-700 transition-colors hover:bg-base-100 dark:text-base-200 dark:hover:bg-white/5"
              >
                <AlertCircle size={16} className="text-base-400" />
                My Complaints
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                window.Intercom?.("show");
              }}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-base-700 transition-colors hover:bg-base-100 dark:text-base-200 dark:hover:bg-white/5"
            >
              <MessageCircle size={16} className="text-base-400" />
              Support
            </button>
          </div>
          <div className="border-t border-base-200 py-1 dark:border-base-700">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <Icon name="logout-icon" size={16} />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
