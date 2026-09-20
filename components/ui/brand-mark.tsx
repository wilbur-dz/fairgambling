import Image from "next/image";

type BrandMarkProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function BrandMark({
  size = 30,
  className,
  priority = false,
}: BrandMarkProps) {
  return (
    <Image
      src="/icons/fg-icon.svg"
      alt="FairGambling"
      width={size}
      height={Math.round(size * 0.91)}
      className={className}
      style={{ height: "auto" }}
      priority={priority}
    />
  );
}
