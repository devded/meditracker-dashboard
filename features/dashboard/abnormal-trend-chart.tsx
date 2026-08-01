'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getAbnormalTrendByReport } from '@/services/report-service';
import { AlertTriangle } from 'lucide-react';

export function AbnormalTrendChart() {
  const [data, setData] = React.useState<{ date: string; lab: string; total: number; abnormal: number; normal: number }[]>([]);

  React.useEffect(() => {
    getAbnormalTrendByReport().then(setData);
  }, []);

  const chartConfig = {
    normal: {
      label: 'Normal Biomarkers',
      color: 'var(--chart-2)',
    },
    abnormal: {
      label: 'Abnormal Flags',
      color: 'var(--chart-5)',
    },
  } satisfies ChartConfig;

  return (
    <Card className="col-span-full lg:col-span-1 shadow-xs border-border/80">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-base font-semibold">Abnormal Flag Trend per Report</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Comparison of normal vs abnormal flagged biomarker counts per lab visit.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
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
                  indicator="dashed"
                  formatter={(value, name) => (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground font-medium">{name}:</span>
                      <span className="font-mono font-bold text-foreground">{value}</span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="normal" stackId="a" fill="var(--color-normal)" radius={[0, 0, 4, 4]} />
            <Bar dataKey="abnormal" stackId="a" fill="var(--color-abnormal)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
