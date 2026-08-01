'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine, Cell } from 'recharts';
import { Report } from '@/types';
import { ArrowUpDown } from 'lucide-react';

interface DeltaChangeBarChartProps {
  reports: Report[];
}

export function DeltaChangeBarChart({ reports }: DeltaChangeBarChartProps) {
  const latestReport = reports[0]; // Newest
  const previousReport = reports[1]; // Second newest

  const deltaData = React.useMemo(() => {
    if (!latestReport || !previousReport) return [];

    const keyBiomarkers = [
      { name: 'Platelets (k)', keyLatest: 'Total Platelet Count', div: 1000, invertGood: false },
      { name: 'Vitamin D', keyLatest: 'Vitamin D', div: 1, invertGood: false },
      { name: 'HbA1c', keyLatest: 'HbA1c', div: 1, invertGood: true },
      { name: 'Glucose', keyLatest: 'Glucose', div: 1, invertGood: true },
      { name: 'Cholesterol', keyLatest: 'Cholesterol', div: 1, invertGood: true },
      { name: 'ESR', keyLatest: 'ESR', div: 1, invertGood: true },
      { name: 'Creatinine', keyLatest: 'Creatinine', div: 1, invertGood: true },
      { name: 'Hemoglobin', keyLatest: 'Haemoglobin', div: 1, invertGood: false },
    ];

    return keyBiomarkers
      .map((bm) => {
        const testLatest = latestReport.tests.find((t) => t.name.toLowerCase().trim() === bm.keyLatest.toLowerCase().trim());
        const testPrev = previousReport.tests.find((t) => t.name.toLowerCase().trim() === bm.keyLatest.toLowerCase().trim());

        if (!testLatest || !testPrev) return null;

        const valLatest = testLatest.value / bm.div;
        const valPrev = testPrev.value / bm.div;
        const delta = Math.round((valLatest - valPrev) * 10) / 10;

        const isGood = bm.invertGood ? delta < 0 : delta > 0;

        return {
          biomarker: bm.name,
          delta,
          isGood,
          latestRaw: testLatest.rawValue,
          prevRaw: testPrev.rawValue,
          unit: testLatest.unit,
        };
      })
      .filter(Boolean);
  }, [latestReport, previousReport]);

  if (deltaData.length === 0) return null;

  return (
    <Card className="shadow-xs border-border/80 h-full flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            Delta Change (Δ) Since Last Visit <ArrowUpDown className="h-4 w-4 text-primary" />
          </CardTitle>
        </div>
        <CardDescription className="text-xs">
          Comparison between {latestReport?.formattedDate} vs {previousReport?.formattedDate}.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 flex-1">
        <ChartContainer
          config={{
            delta: { label: 'Delta Change', color: 'var(--chart-1)' },
          }}
          className="h-[220px] w-full"
        >
          <BarChart data={deltaData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
            <XAxis
              dataKey="biomarker"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              className="text-[10px] text-muted-foreground font-mono"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-[10px] text-muted-foreground font-mono"
            />
            <ReferenceLine y={0} stroke="var(--border)" />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(val, name, item) => {
                    const p = item.payload;
                    const numVal = Number(val ?? 0);
                    return (
                      <div className="text-xs space-y-1">
                        <div className="font-bold">{p.biomarker}</div>
                        <div>Change: <span className="font-mono font-bold">{numVal > 0 ? `+${numVal}` : numVal}</span></div>
                        <div className="text-muted-foreground text-[10px]">
                          Prev: {p.prevRaw} {p.unit} → Current: {p.latestRaw} {p.unit}
                        </div>
                      </div>
                    );
                  }}
                />
              }
            />
            <Bar dataKey="delta" radius={[4, 4, 0, 0]}>
              {deltaData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry?.isGood ? 'hsl(160 60% 45%)' : 'hsl(350 89% 60%)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
