"use client";

import { useState } from "react";

export function pfpUrl(username: string): string {
  return `https://cdn.fairgambling.com/pfps/${username.trim().toLowerCase()}.webp`;
}

type StreamerAvatarProps = {
  name: string;
  src?: string | null;
  size?: number;
  rounded?: string;
};

export function StreamerAvatar({
  name,
  src,
  size = 32,
  rounded = "rounded-full",
}: StreamerAvatarProps) {
  const [failed, setFailed] = useState(false);
  const url = src ?? pfpUrl(name);

  if (url && !failed) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className={`shrink-0 ${rounded} object-cover`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center ${rounded} bg-gradient-to-b from-[#9a80f9] to-[#322098] font-semibold text-white`}
      style={{ width: size, height: size, fontSize: Math.round(0.4 * size) }}
    >
      {(name.trim()[0] ?? "?").toUpperCase()}
    </span>
  );
}

export function StreamerAvatarLink({
  name,
  src,
  size = 32,
}: {
  name: string;
  src?: string | null;
  size?: number;
}) {
  return <StreamerAvatar name={name} src={src} size={size} />;
}
