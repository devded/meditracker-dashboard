'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceArea } from 'recharts';
import { Report } from '@/types';
import { parseReferenceRange } from '@/utils/parse-reference-range';
import { toast } from 'sonner';
import { Layers, ShieldCheck } from 'lucide-react';

interface BiomarkerComparisonRangeChartProps {
  reports: Report[];
}

export function BiomarkerComparisonRangeChart({ reports }: BiomarkerComparisonRangeChartProps) {
  const ALL_BIOMARKERS = [
    { name: 'Cholesterol', color: '#ea580c' },
    { name: 'Creatinine', color: '#0d9488' },
    { name: 'ESR', color: '#2563eb' },
    { name: 'Glucose', color: '#64748b' },
    { name: 'Haemoglobin', color: '#7c3aed' },
    { name: 'Total Platelet Count', color: '#f43f5e' },
    { name: 'Total WBC', color: '#0284c7' },
    { name: 'Triglycerides', color: '#d97706' },
    { name: 'Urea', color: '#059669' },
    { name: 'Vitamin D', color: '#8b5cf6' },
  ];

  // Currently selected active series (max 5)
  const [selectedSeries, setSelectedSeries] = React.useState<string[]>([
    'Cholesterol',
    'Creatinine',
    'ESR',
  ]);

  const toggleSeries = (name: string) => {
    if (selectedSeries.includes(name)) {
      if (selectedSeries.length === 1) {
        toast.info('At least one series must remain selected.');
        return;
      }
      setSelectedSeries((prev) => prev.filter((s) => s !== name));
    } else {
      if (selectedSeries.length >= 5) {
        toast.warning('Maximum 5 series allowed simultaneously.');
        return;
      }
      setSelectedSeries((prev) => [...prev, name]);
    }
  };

  // Build normalized reference percentage data
  const chartData = React.useMemo(() => {
    const sorted = [...reports].sort(
      (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
    );

    return sorted.map((r) => {
      const point: Record<string, any> = { date: r.formattedDate };

      ALL_BIOMARKERS.forEach((bm) => {
        const test = r.tests.find(
          (t) => t.name.toLowerCase().trim() === bm.name.toLowerCase().trim()
        );
        if (test) {
          const bounds = parseReferenceRange(test.referenceRange);
          if (bounds && bounds.max > bounds.min) {
            // 0% = range floor (min), 100% = range ceiling (max)
            const pct = Math.round(((test.value - bounds.min) / (bounds.max - bounds.min)) * 100);
            point[bm.name] = pct;
            point[`${bm.name}_raw`] = `${test.rawValue} ${test.unit}`;
          } else {
            point[bm.name] = 50; // Fallback center
            point[`${bm.name}_raw`] = `${test.rawValue} ${test.unit}`;
          }
        }
      });

      return point;
    });
  }, [reports]);

  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs rounded-3xl">
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-foreground font-sans">Biomarker Range Comparison</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          Normalized multi-series view (% of reference range). Shaded green band (0–100%) represents optimal physiological bounds.
        </p>
      </div>

      {/* Interactive Multi-Select Legend Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {ALL_BIOMARKERS.map((bm) => {
          const active = selectedSeries.includes(bm.name);
          return (
            <button
              key={bm.name}
              onClick={() => toggleSeries(bm.name)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-mono transition-all border ${
                active
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 font-bold shadow-2xs'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: active ? (bm.color) : '#94a3b8' }}
              />
              <span>{bm.name}</span>
            </button>
          );
        })}
      </div>

      {/* Multi-Series Line Chart with Green Reference Band (0-100%) */}
      <div className="h-[280px] w-full pt-2">
        <ChartContainer
          config={selectedSeries.reduce((acc, name) => {
            const found = ALL_BIOMARKERS.find((b) => b.name === name);
            acc[name] = { label: name, color: found ? found.color : '#0f172a' };
            return acc;
          }, {} as any)}
          className="h-full w-full"
        >
          <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
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
              tickFormatter={(v) => `${v}%`}
              domain={[-20, 'auto']}
              className="text-[10px] text-muted-foreground font-mono"
            />
            {/* Highlighted Green Reference Band (0% to 100% inside range) */}
            <ReferenceArea
              y1={0}
              y2={100}
              fill="#10b981"
              fillOpacity={0.12}
              stroke="#10b981"
              strokeDasharray="3 3"
              strokeOpacity={0.4}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(val, name, item) => (
                    <div className="flex items-center justify-between gap-4 text-xs font-mono">
                      <span className="text-muted-foreground">{name}:</span>
                      <span className="font-bold text-foreground">
                        {val}% ({item.payload[`${name}_raw`]})
                      </span>
                    </div>
                  )}
                />
              }
            />
            {selectedSeries.map((name) => {
              const found = ALL_BIOMARKERS.find((b) => b.name === name);
              const color = found ? found.color : '#0f172a';
              return (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  name={name}
                  stroke={color}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: color, stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ChartContainer>
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground">
        <span>Showing {selectedSeries.length} of max 5 active series.</span>
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
          <ShieldCheck className="size-3.5" /> Green Band (0%–100%) = Normal Clinical Reference
        </span>
      </div>
    </Card>
  );
}
