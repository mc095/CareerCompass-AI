"use client"

import * as React from "react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import { getUserScores } from "@/app/actions";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton";

const defaultSkills = [
  "Communication",
  "Technical",
  "Problem Solving",
  "Leadership",
  "Project Mgmt",
  "Teamwork",
];

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
};

export function UserProgress() {
  const [chartData, setChartData] = React.useState<any[] | null>(null);

  React.useEffect(() => {
    async function loadScores() {
      const scores = await getUserScores();
      const newChartData = defaultSkills.map(skill => ({
        skill,
        score: scores[skill] || 0,
      }));
      setChartData(newChartData);
    }
    loadScores();
  }, []);

  if (!chartData) {
    return <Skeleton className="mx-auto aspect-square h-[250px] rounded-full" />
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[250px]"
    >
      <RadarChart
        data={chartData}
        margin={{
          top: 10,
          right: 10,
          bottom: 10,
          left: 10,
        }}
      >
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <PolarAngleAxis dataKey="skill" />
        <PolarGrid />
        <Radar
          dataKey="score"
          fill="var(--color-score)"
          fillOpacity={0.6}
          dot={{
            r: 4,
            fillOpacity: 1,
          }}
        />
      </RadarChart>
    </ChartContainer>
  )
}
