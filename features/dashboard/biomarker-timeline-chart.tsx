'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Report } from '@/types';

interface BiomarkerTimelineChartProps {
  reports: Report[];
}

export function BiomarkerTimelineChart({ reports }: BiomarkerTimelineChartProps) {
  // Extract all unique biomarker names across reports
  const availableBiomarkers = React.useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => r.tests.forEach((t) => set.add(t.name)));
    return Array.from(set);
  }, [reports]);

  const [selectedBiomarker, setSelectedBiomarker] = React.useState<string>(
    availableBiomarkers.includes('Cholesterol') ? 'Cholesterol' : availableBiomarkers[0] || 'Haemoglobin'
  );

  // Build trend timeline data for selected biomarker
  const chartData = React.useMemo(() => {
    return [...reports]
      .sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime())
      .map((r) => {
        const test = r.tests.find((t) => t.name.toLowerCase().trim() === selectedBiomarker.toLowerCase().trim());
        return {
          date: r.formattedDate,
          val: test ? test.value : null,
          rawValue: test ? test.rawValue : 'N/A',
          unit: test ? test.unit : '',
          isAbnormal: test ? test.isAbnormal : false,
          refRange: test ? test.referenceRange : '',
        };
      })
      .filter((d) => d.val !== null);
  }, [reports, selectedBiomarker]);

  const chartConfig = {
    val: {
      label: selectedBiomarker,
      color: '#ea580c', // Orange accent matching reference image
    },
  } satisfies ChartConfig;

  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h3 className="text-base font-bold text-foreground">Biomarker timeline</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track a single biomarker across every report
          </p>
        </div>

        <Select
          value={selectedBiomarker}
          onValueChange={(val) => setSelectedBiomarker(val || availableBiomarkers[0])}
        >
          <SelectTrigger className="w-[180px] h-9 text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <SelectValue placeholder="Select Biomarker" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {availableBiomarkers.map((b) => (
              <SelectItem key={b} value={b} className="text-xs font-mono">
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="h-[240px] w-full pt-4">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200/60 dark:stroke-slate-800" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              className="text-[10px] text-muted-foreground font-mono"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              domain={['auto', 'auto']}
              className="text-[10px] text-muted-foreground font-mono"
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(val, name, item) => (
                    <div className="flex items-center justify-between gap-4 text-xs font-mono">
                      <span className="text-muted-foreground">{selectedBiomarker}:</span>
                      <span className="font-bold text-foreground">
                        {item.payload.rawValue} {item.payload.unit}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="val"
              stroke="#ea580c"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#ea580c', stroke: '#ffffff', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </Card>
  );
}
