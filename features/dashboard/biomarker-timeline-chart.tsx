'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Report } from '@/types';
import { normaliseForChart, getDominantUnit } from '@/utils/normalise-unit';
import { TrendingUp } from 'lucide-react';

interface BiomarkerTimelineChartProps {
  reports: Report[];
  selectedBiomarker?: string;
  onSelectBiomarker?: (biomarker: string) => void;
}

export function BiomarkerTimelineChart({
  reports,
  selectedBiomarker: externalBiomarker,
  onSelectBiomarker: externalOnSelect,
}: BiomarkerTimelineChartProps) {
  // Extract all unique biomarker names across reports
  const availableBiomarkers = React.useMemo(() => {
    const set = new Set<string>();
    reports.forEach((r) => r.tests.forEach((t) => set.add(t.name)));
    return Array.from(set);
  }, [reports]);

  const [internalBiomarker, setInternalBiomarker] = React.useState<string>('');

  // Reports arrive after the first paint, so resolve the fallback during render
  // rather than pinning a name that may not exist in this patient's data.
  const resolvedInternal =
    internalBiomarker && availableBiomarkers.includes(internalBiomarker)
      ? internalBiomarker
      : availableBiomarkers[0] ?? '';

  const selectedBiomarker = externalBiomarker || resolvedInternal;

  const handleSelect = (val: string) => {
    setInternalBiomarker(val);
    if (externalOnSelect) {
      externalOnSelect(val);
    }
  };

  // Build trend timeline data for selected biomarker, normalising units so all
  // points on the same line share a single consistent unit.
  const { chartData, displayUnit } = React.useMemo(() => {
    const sorted = [...reports].sort(
      (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
    );

    // Collect every test entry for the selected biomarker to detect the dominant unit.
    const matchingTests = sorted.flatMap((r) =>
      r.tests.filter((t) => t.name.toLowerCase().trim() === selectedBiomarker.toLowerCase().trim())
    );
    const dominant = getDominantUnit(selectedBiomarker, matchingTests);

    const points = sorted
      .map((r) => {
        const test = r.tests.find(
          (t) => t.name.toLowerCase().trim() === selectedBiomarker.toLowerCase().trim()
        );
        if (!test) return null;

        const norm = normaliseForChart(selectedBiomarker, test.value, test.unit, dominant);
        if (!norm) return null; // incompatible unit family — skip

        return {
          date: r.formattedDate,
          val: norm.value,
          rawValue: test.rawValue,
          unit: norm.unit,
          isAbnormal: test.isAbnormal,
          refRange: test.referenceRange,
        };
      })
      .filter(Boolean) as {
        date: string; val: number; rawValue: string;
        unit: string; isAbnormal: boolean; refRange: string | null;
      }[];

    return { chartData: points, displayUnit: points[0]?.unit ?? '' };
  }, [reports, selectedBiomarker]);

  const chartConfig = {
    val: {
      label: `${selectedBiomarker}${displayUnit ? ` (${displayUnit})` : ''}`,
      color: '#ea580c',
    },
  } satisfies ChartConfig;

  return (
    <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 p-6 flex flex-col justify-between shadow-xs rounded-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-emerald-500" />
            <h3 className="text-base font-bold text-foreground font-sans">Biomarker Timeline Tracking</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Single-parameter longitudinal progression across historical lab visits
          </p>
        </div>

        <Select value={selectedBiomarker} onValueChange={(val) => handleSelect(val || availableBiomarkers[0])}>
          <SelectTrigger className="w-[200px] h-9 text-xs font-semibold rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
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

      <div className="h-[250px] w-full pt-4">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-200/60 dark:stroke-zinc-800/60" />
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
              label={displayUnit ? { value: displayUnit, angle: -90, position: 'insideLeft', offset: 15, style: { fontSize: 10, fill: '#a1a1aa' } } : undefined}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(_val, _name, item) => (
                    <div className="flex items-center justify-between gap-4 text-xs font-mono">
                      <span className="text-muted-foreground">{selectedBiomarker}:</span>
                      <span className="font-bold text-foreground">
                        {item.payload.val} {item.payload.unit}
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
