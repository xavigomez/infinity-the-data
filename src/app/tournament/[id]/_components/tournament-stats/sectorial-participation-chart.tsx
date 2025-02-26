import {
  Card,
  CardContent,
  CardDescription,
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

interface Props {
  stats: Record<string, number>;
}

export function SectorialParticipationChart({ stats }: Props) {
  const { getShortNameFromCode } = useGetFactionName();
  const factionData = Object.entries(stats)
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
  const factionChartConfig = Object.keys(stats).reduce((config, faction) => {
    const factionName =
      getShortNameFromCode(faction as FactionCode) || "Unknown";
    config[faction] = {
      label: factionName,
      color: `var(--faction-${faction.toLowerCase()})`,
    };
    return config;
  }, {} as ChartConfig);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Sectorial participation</CardTitle>
        <CardDescription># of sectorials</CardDescription>
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
              data={factionData}
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
    </Card>
  );
}
