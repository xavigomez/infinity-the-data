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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { CircleHelp } from "lucide-react";

interface Props {
  factionPerformance: Record<FactionCode, number>;
  sectorialPerformance: Record<FactionCode, number>;
}

export function FactionPerformanceChart({
  factionPerformance,
  sectorialPerformance,
}: Props) {
  const [showSectorial, setShowSectorial] = useState(false);
  const { getShortNameFromCode } = useGetFactionName();

  const factionData = Object.entries(factionPerformance)
    .map(([faction, points]) => {
      const factionName =
        getShortNameFromCode(faction as FactionCode) || "Unknown";
      return {
        faction: factionName,
        total: points,
        fill: `var(--faction-${faction})`,
      };
    })
    .sort((a, b) => b.total - a.total);

  const sectorialData = Object.entries(sectorialPerformance)
    .map(([faction, points]) => {
      const factionName =
        getShortNameFromCode(faction as FactionCode) || "Unknown";
      return {
        faction: factionName,
        total: points,
        fill: `var(--faction-${faction})`,
      };
    })
    .sort((a, b) => b.total - a.total);

  const factionChartConfig = Object.keys(factionData).reduce(
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
          {showSectorial ? "Sectorial " : "Faction"} performance
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          <span>AVG of SUM of tp, op, and vp</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="cursor-pointer" asChild>
                <CircleHelp className="size-4" />
              </TooltipTrigger>
              <TooltipContent className="w-[300px] space-y-1">
                <p>This score is calculated with the following formula: </p>
                <p className="rounded bg-muted/50 p-1 font-mono text-xs">
                  score = ({showSectorial ? "sectorial" : "faction"}_tp +{" "}
                  {showSectorial ? "sectorial" : "faction"}_op +{" "}
                  {showSectorial ? "sectorial" : "faction"}_vp) /
                  faction_players
                </p>
                <p>Feel free to contact me to discuss a better approach.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
          id="breakdown-sectorial-performance"
          checked={showSectorial}
          onCheckedChange={(checked) => setShowSectorial(checked)}
        />
        <Label htmlFor="breakdown-sectorial-performance" className="text-xs">
          Breakdown by sectorial
        </Label>
      </CardFooter>
    </Card>
  );
}
