type PlayerAvatarProps = {
  name: string;
  size?: number;
};

const AVATAR_COLORS = [
  "#8874ff",
  "#00ff86",
  "#ffcf2f",
  "#f7575f",
  "#60a5fa",
  "#a48dff",
];

/** Port of reference `PlayerAvatar`. */
export function PlayerAvatar({ name, size = 28 }: PlayerAvatarProps) {
  const label = name?.trim() || "?";
  const color =
    AVATAR_COLORS[
      [...label].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
        AVATAR_COLORS.length
    ];

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(0.42 * size),
        background: `${color}26`,
        color,
      }}
    >
      {label.charAt(0).toUpperCase()}
    </span>
  );
}
