"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type AvatarProps = {
  src?: string | null;
  username?: string | null;
  email?: string | null;
  size?: number;
  className?: string;
  deactivated?: boolean;
};

export function Avatar({
  src,
  username,
  email,
  size = 40,
  className = "",
  deactivated = false,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const label = username || (email ? email.split("@")[0] : "User") || "User";
  const initials =
    label
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("")
      .slice(0, 2) || label.slice(0, 2).toUpperCase();

  const showImage = !!src?.trim() && !failed && !deactivated;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white ${
        deactivated ? "bg-base-300 dark:bg-base-700" : "bg-blue-500"
      } ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {showImage ? (
        <Image
          src={src!}
          alt={label}
          fill
          className="rounded-full object-cover"
          unoptimized={src!.startsWith("http")}
          onError={() => setFailed(true)}
        />
      ) : deactivated ? null : (
        <span>{initials}</span>
      )}
    </div>
  );
}
