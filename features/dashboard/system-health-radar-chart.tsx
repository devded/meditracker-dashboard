'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { getReports } from '@/services/report-service';
import { Activity, ShieldCheck } from 'lucide-react';

export function SystemHealthRadarChart() {
  const [data, setData] = React.useState<{ system: string; score: number; total: number }[]>([]);

  React.useEffect(() => {
    getReports().then((reports) => {
      // Calculate normal parameters ratio per physiological system
      const systems = {
        Hematology: { total: 0, normal: 0 },
        Electrolytes: { total: 0, normal: 0 },
        Kidney: { total: 0, normal: 0 },
        Liver: { total: 0, normal: 0 },
        Hormones: { total: 0, normal: 0 },
        Biochemistry: { total: 0, normal: 0 },
      };

      reports.forEach((r) => {
        r.tests.forEach((t) => {
          let sysKey = t.category as keyof typeof systems;
          if (sysKey === ('Hormone' as any)) sysKey = 'Hormones';
          if (systems[sysKey]) {
            systems[sysKey].total += 1;
            if (!t.isAbnormal) systems[sysKey].normal += 1;
          }
        });
      });

      const radarData = Object.entries(systems).map(([system, val]) => ({
        system,
        score: val.total > 0 ? Math.round((val.normal / val.total) * 100) : 100,
        total: val.total,
      }));

      setData(radarData);
    });
  }, []);

  const chartConfig = {
    score: {
      label: 'Health Score (% Normal)',
      color: 'var(--chart-1)',
    },
  } satisfies ChartConfig;

  return (
    <Card className="col-span-full lg:col-span-1 shadow-xs border-border/80 flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
          <CardTitle className="text-base font-semibold">Organ System Stability Radar</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Percentage of normal parameters across organ systems.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-center">
        <ChartContainer config={chartConfig} className="h-[250px] w-full mx-auto">
          <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid className="stroke-border/40" />
            <PolarAngleAxis dataKey="system" className="text-[10px] font-mono text-muted-foreground" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-[9px] font-mono text-muted-foreground" />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(val, name) => (
                    <span className="font-mono font-bold text-foreground">{val}% Normal Range</span>
                  )}
                />
              }
            />
            <Radar
              name="Health Score"
              dataKey="score"
              stroke="var(--color-score)"
              fill="var(--color-score)"
              fillOpacity={0.4}
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
