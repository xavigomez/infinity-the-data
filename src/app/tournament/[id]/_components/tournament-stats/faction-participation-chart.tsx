import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Pie, PieChart } from "recharts";
import { useGetFactionName } from "~/hooks/factions/use-faction-names";
import { type FactionCode } from "~/types/factions";
import { useState } from "react";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";

interface Props {
  factionStats: Record<string, number>;
  sectorialStats: Record<string, number>;
}

export function FactionParticipationChart({
  factionStats,
  sectorialStats,
}: Props) {
  const [showSectorial, setShowSectorial] = useState(false);
  const { getShortNameFromCode } = useGetFactionName();
  const factionData = Object.entries(factionStats)
    .map(([faction, count]) => {
      const factionName =
        getShortNameFromCode(faction as FactionCode) || "Unknown";
      return {
        faction: factionName,
        total: count,
        fill: `var(--faction-${faction})`,
      };
    })
    .sort((a, b) => b.total - a.total || a.faction.localeCompare(b.faction));
  const sectorialData = Object.entries(sectorialStats)
    .map(([faction, count]) => {
      const factionName =
        getShortNameFromCode(faction as FactionCode) || "Unknown";
      return {
        faction: factionName,
        total: count,
        fill: `var(--faction-${faction})`,
      };
    })
    .sort((a, b) => b.total - a.total || a.faction.localeCompare(b.faction));
  const factionChartConfig = Object.keys(factionStats).reduce(
    (config, faction) => {
      const factionName =
        getShortNameFromCode(faction as FactionCode) || "Unknown";
      config[faction] = {
        label: factionName,
        color: `var(--faction-${faction.toLowerCase()})`,
      };
      return config;
    },
    {} as ChartConfig,
  );

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>
          {showSectorial ? "Sectorial " : "Faction"} participation
        </CardTitle>
        <CardDescription>
          COUNT of {showSectorial ? "sectorials" : "faction"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={factionChartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={showSectorial ? sectorialData : factionData}
              dataKey="total"
              nameKey="faction"
              innerRadius={40}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="justify-center gap-2">
        <Switch
          id="breakdown-secotorial"
          checked={showSectorial}
          onCheckedChange={(checked) => setShowSectorial(checked)}
        />
        <Label htmlFor="breakdown-secotorial" className="text-xs">
          Breakdown by sectorial
        </Label>
      </CardFooter>
    </Card>
  );
}
