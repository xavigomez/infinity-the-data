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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface Props {
  factionPoints: Record<FactionCode, { vp: number; op: number; tp: number }>;
  sectorialPoints: Record<FactionCode, { vp: number; op: number; tp: number }>;
}

export function FactionPointsChart({ factionPoints, sectorialPoints }: Props) {
  const [showSectorial, setShowSectorial] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<"tp" | "op" | "vp">(
    "tp",
  );
  const { getShortNameFromCode } = useGetFactionName();

  const factionData = Object.entries(factionPoints)
    .map(([faction, points]) => {
      const factionName =
        getShortNameFromCode(faction as FactionCode) || "Unknown";
      return {
        faction: factionName,
        total:
          selectedPoints === "tp"
            ? points.tp
            : selectedPoints === "op"
              ? points.op
              : points.vp,
        fill: `var(--faction-${faction})`,
      };
    })
    .sort((a, b) => b.total - a.total);

  const sectorialData = Object.entries(sectorialPoints)
    .map(([faction, points]) => {
      const factionName =
        getShortNameFromCode(faction as FactionCode) || "Unknown";
      return {
        faction: factionName,
        total:
          selectedPoints === "tp"
            ? points.tp
            : selectedPoints === "op"
              ? points.op
              : points.vp,
        fill: `var(--faction-${faction})`,
      };
    })
    .sort((a, b) => b.total - a.total);

  const factionChartConfig = Object.keys(factionPoints).reduce(
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
        <CardTitle>Faction points</CardTitle>
        <CardDescription>SUM of faction points</CardDescription>
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
      <CardFooter className="grid grid-cols-2 justify-center gap-2">
        <div className="flex items-center justify-center">
          <Select
            value={selectedPoints}
            onValueChange={(value) =>
              setSelectedPoints(value as "tp" | "op" | "vp")
            }
          >
            <SelectTrigger className="h-auto w-[142px] px-2 py-1 text-xs">
              <SelectValue placeholder="Points type" />
            </SelectTrigger>
            <SelectContent className="">
              <SelectItem value="tp" className="cursor-pointer text-xs">
                Tournament Points
              </SelectItem>
              <SelectItem value="op" className="cursor-pointer text-xs">
                Objective Points
              </SelectItem>
              <SelectItem value="vp" className="cursor-pointer text-xs">
                Victory Points
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Switch
            id="breakdown-sectorial-points"
            checked={showSectorial}
            onCheckedChange={(checked) => setShowSectorial(checked)}
          />
          <Label htmlFor="breakdown-sectorial-points" className="text-xs">
            By sectorial
          </Label>
        </div>
      </CardFooter>
    </Card>
  );
}
