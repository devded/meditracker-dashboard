'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { getCategoryDistribution } from '@/services/report-service';
import { PieChart as PieIcon } from 'lucide-react';

export function CategoryDistributionChart() {
  const [data, setData] = React.useState<{ category: string; count: number; fill: string }[]>([]);

  React.useEffect(() => {
    getCategoryDistribution().then(setData);
  }, []);

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};
    data.forEach((item, idx) => {
      config[item.category] = {
        label: item.category,
        color: `var(--chart-${(idx % 5) + 1})`,
      };
    });
    return config;
  }, [data]);

  return (
    <Card className="col-span-full lg:col-span-1 shadow-xs border-border/80 flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <PieIcon className="h-5 w-5 text-teal-500" />
          <CardTitle className="text-base font-semibold">Test Category Distribution</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Proportional breakdown of tests across medical specialties.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-center pt-2">
        <ChartContainer config={chartConfig} className="h-[260px] w-full mx-auto">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="category"
                  formatter={(value, name) => (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">{name}:</span>
                      <span className="font-mono font-bold text-foreground">{value} tests</span>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={data}
              dataKey="count"
              nameKey="category"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              strokeWidth={2}
              stroke="var(--background)"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`var(--chart-${(index % 5) + 1})`} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="category" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
