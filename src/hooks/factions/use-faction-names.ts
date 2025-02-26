import {
  FactionCodes,
  FactionNames,
  FactionShortNames,
} from "~/constants/factions";
import { useMemo } from "react";
import { type FactionCode } from "~/types/factions";

export function useGetFactionName() {
  const getNameFromCode = useMemo(
    () =>
      (code: FactionCode): string => {
        // Type-safe way to get the enum key from a value
        const codeKey = (
          Object.entries(FactionCodes) as [string, string][]
        ).find(([_, value]) => value === code)?.[0];

        return FactionNames[codeKey as keyof typeof FactionNames];
      },
    [],
  );

  const getShortNameFromCode = useMemo(
    () =>
      (code: FactionCode): string => {
        // Type-safe way to get the enum key from a value
        const codeKey = (
          Object.entries(FactionCodes) as [string, string][]
        ).find(([_, value]) => value === code)?.[0];

        return FactionShortNames[codeKey as keyof typeof FactionShortNames];
      },
    [],
  );

  return { getNameFromCode, getShortNameFromCode };
}
