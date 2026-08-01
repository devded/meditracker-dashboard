'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { getReports } from '@/services/report-service';
import { Activity, AlertTriangle } from 'lucide-react';

export function BiomarkerValueReferenceComparisonChart() {
  const [data, setData] = React.useState<
    { biomarker: string; currentValue: number; rawValue: string; minRange: number; maxRange: number; isAbnormal: boolean; unit: string }[]
  >([]);

  React.useEffect(() => {
    getReports().then((reports) => {
      if (reports.length === 0) return;
      const latest = reports[0];

      // Key representative biomarkers
      const targetBiomarkers = [
        { name: 'ESR', min: 0, max: 15 },
        { name: 'Glucose', min: 70, max: 99 },
        { name: 'Cholesterol', min: 120, max: 200 },
        { name: 'Vitamin D', min: 30, max: 100 },
        { name: 'Creatinine', min: 0.6, max: 1.2 },
        { name: 'Potassium', min: 3.5, max: 5.1 },
        { name: 'Sodium', min: 135, max: 145 },
      ];

      const chartItems = targetBiomarkers.map((target) => {
        const test = latest.tests.find((t) => t.name.toLowerCase().includes(target.name.toLowerCase()));
        const val = test ? test.value : target.min;
        return {
          biomarker: target.name,
          currentValue: val,
          rawValue: test ? test.rawValue : String(val),
          minRange: target.min,
          maxRange: target.max,
          isAbnormal: test ? test.isAbnormal : false,
          unit: test ? test.unit : '',
        };
      });

      setData(chartItems);
    });
  }, []);

  const chartConfig = {
    currentValue: {
      label: 'Current Value',
      color: 'var(--chart-1)',
    },
    maxRange: {
      label: 'Standard Upper Limit',
      color: 'var(--chart-4)',
    },
  } satisfies ChartConfig;

  return (
    <Card className="col-span-full lg:col-span-2 shadow-xs border-border/80">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold">Current Values vs Standard Reference Limits</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Direct quantitative comparison of observed biomarker values against upper physiological reference thresholds.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[270px] w-full">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/40" />
            <XAxis type="number" tickLine={false} axisLine={false} className="text-[10px] font-mono text-muted-foreground" />
            <YAxis dataKey="biomarker" type="category" tickLine={false} axisLine={false} className="text-[11px] font-medium text-foreground" />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(val, name, item) => (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground font-medium">{name}:</span>
                      <span className="font-mono font-bold text-foreground">
                        {val} {item.payload.unit}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="currentValue" fill="var(--color-currentValue)" radius={[0, 4, 4, 0]} barSize={12} />
            <Bar dataKey="maxRange" fill="var(--color-maxRange)" radius={[0, 4, 4, 0]} barSize={12} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
