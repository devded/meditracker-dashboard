'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getReports } from '@/services/report-service';
import { TrendingUp, Activity } from 'lucide-react';

export function MonthlyFlagAreaChart() {
  const [data, setData] = React.useState<{ date: string; total: number; abnormal: number; normal: number }[]>([]);

  React.useEffect(() => {
    getReports().then((reports) => {
      const sorted = [...reports].sort(
        (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
      );

      const areaData = sorted.map((r) => {
        const abnormal = r.tests.filter((t) => t.isAbnormal).length;
        return {
          date: r.formattedDate,
          total: r.tests.length,
          abnormal,
          normal: r.tests.length - abnormal,
        };
      });

      setData(areaData);
    });
  }, []);

  const chartConfig = {
    total: {
      label: 'Total Tested Biomarkers',
      color: 'var(--chart-1)',
    },
    abnormal: {
      label: 'Abnormal Flags',
      color: 'var(--chart-5)',
    },
  } satisfies ChartConfig;

  return (
    <Card className="col-span-full lg:col-span-2 shadow-xs border-border/80">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold">Diagnostic Density & Flag Frequency</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Longitudinal progression of total diagnostic panel volume vs abnormal flags.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={data} margin={{ top: 15, right: 15, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="fillAbnormal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-abnormal)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--color-abnormal)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              className="text-[11px] text-muted-foreground font-mono"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              className="text-[11px] text-muted-foreground font-mono"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(val, name) => (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground font-medium">{name}:</span>
                      <span className="font-mono font-bold text-foreground">{val}</span>
                    </div>
                  )}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--color-total)"
              fill="url(#fillTotal)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="abnormal"
              stroke="var(--color-abnormal)"
              fill="url(#fillAbnormal)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
