import type { FactionCode } from "~/types/factions";

import Image from "next/image";

type FactionLogoProps = {
  factionCode: FactionCode;
  className?: string;
};

export function FactionLogo({ factionCode, className }: FactionLogoProps) {
  // Return the logo if it exists
  // Also 1199 is missing
  // TODO: fix svg for 1199
  if (!factionCode || factionCode === "1199") return null;
  return (
    <Image
      src={`/assets/logos/faction/${factionCode}.svg`}
      // TODO: Implement alt text for each faction logo
      alt="Sectorial Logo"
      width={24}
      height={24}
      className={className}
    />
  );
}
