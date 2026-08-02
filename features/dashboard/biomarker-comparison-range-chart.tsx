'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceArea } from 'recharts';
import { Report, Test } from '@/types';
import { normaliseForChart } from '@/utils/normalise-unit';
import { parseReferenceRange } from '@/utils/parse-reference-range';
import { toast } from 'sonner';
import { Layers, ShieldCheck } from 'lucide-react';

interface BiomarkerComparisonRangeChartProps {
  reports: Report[];
}

const SERIES_COLORS = [
  '#ea580c',
  '#0d9488',
  '#2563eb',
  '#64748b',
  '#7c3aed',
  '#f43f5e',
  '#0284c7',
  '#d97706',
  '#059669',
  '#8b5cf6',
];

// Preferred ordering only — the selectable series come from the patient's own reports.
const PREFERRED_BIOMARKERS = [
  'Cholesterol',
  'S. Creatinine',
  'ESR',
  'Glucose',
  'Haemoglobin',
  'Total Platelet Count',
  'Total WBC',
  'Triglycerides',
  'S. Urea',
  'Vitamin D',
];

const MAX_SERIES = 5;
const SERIES_LIMIT = 10;

export function BiomarkerComparisonRangeChart({ reports }: BiomarkerComparisonRangeChartProps) {
  // Only biomarkers present in the patient's reports can be compared. Ordered by
  // preferred panel first, then by how often they recur across reports.
  const ALL_BIOMARKERS = React.useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      r.tests.forEach((t) => {
        counts[t.name] = (counts[t.name] || 0) + 1;
      });
    });

    const available = Object.keys(counts);
    const preferred = PREFERRED_BIOMARKERS.filter((name) => available.includes(name));
    const rest = available
      .filter((name) => !preferred.includes(name))
      .sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));

    return [...preferred, ...rest]
      .slice(0, SERIES_LIMIT)
      .map((name, idx) => ({ name, color: SERIES_COLORS[idx % SERIES_COLORS.length] }));
  }, [reports]);

  // Currently selected active series (max 5). Empty means "use the default picks",
  // which are resolved during render since reports arrive after the first paint.
  const [selectedSeries, setSelectedSeries] = React.useState<string[]>([]);

  const activeSeries = React.useMemo(() => {
    const names = ALL_BIOMARKERS.map((b) => b.name);
    const stillValid = selectedSeries.filter((s) => names.includes(s));
    return stillValid.length > 0 ? stillValid : names.slice(0, 3);
  }, [ALL_BIOMARKERS, selectedSeries]);

  const toggleSeries = (name: string) => {
    if (activeSeries.includes(name)) {
      if (activeSeries.length === 1) {
        toast.info('At least one series must remain selected.');
        return;
      }
      setSelectedSeries(activeSeries.filter((s) => s !== name));
    } else {
      if (activeSeries.length >= MAX_SERIES) {
        toast.warning(`Maximum ${MAX_SERIES} series allowed simultaneously.`);
        return;
      }
      setSelectedSeries([...activeSeries, name]);
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
          const norm = normaliseForChart(bm.name, test.value, test.unit);
          const displayVal = norm ? norm.value : test.value;
          const displayUnit = norm ? norm.unit : test.unit;
          const bounds = parseReferenceRange(test.referenceRange);
          if (bounds && bounds.max > bounds.min) {
            // 0% = range floor (min), 100% = range ceiling (max)
            const pct = Math.round(((test.value - bounds.min) / (bounds.max - bounds.min)) * 100);
            point[bm.name] = pct;
            point[`${bm.name}_raw`] = `${displayVal} ${displayUnit}`;
          } else {
            point[bm.name] = 50; // Fallback center
            point[`${bm.name}_raw`] = `${displayVal} ${displayUnit}`;
          }
        }
      });

      return point;
    });
  }, [reports, ALL_BIOMARKERS]);

  return (
    <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 p-6 space-y-4 shadow-xs rounded-3xl">
      <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-emerald-500" />
          <h3 className="text-base font-bold text-foreground font-sans">Biomarker Range Comparison</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          Normalized multi-series view (% of reference range). Shaded green band (0–100%) represents optimal physiological bounds.
        </p>
      </div>

      {/* Interactive Multi-Select Legend Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {ALL_BIOMARKERS.length === 0 && (
          <span className="text-[11px] font-mono text-muted-foreground">
            No biomarkers recorded yet — upload a report to populate this comparison.
          </span>
        )}
        {ALL_BIOMARKERS.map((bm) => {
          const active = activeSeries.includes(bm.name);
          return (
            <button
              key={bm.name}
              onClick={() => toggleSeries(bm.name)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-mono transition-all border ${
                active
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-bold shadow-2xs'
                  : 'bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200/60 dark:border-zinc-800 text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800'
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
          config={activeSeries.reduce((acc, name) => {
            const found = ALL_BIOMARKERS.find((b) => b.name === name);
            acc[name] = { label: name, color: found ? found.color : '#0f172a' };
            return acc;
          }, {} as any)}
          className="h-full w-full"
        >
          <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
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
            {activeSeries.map((name) => {
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

      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground">
        <span>Showing {activeSeries.length} of max {MAX_SERIES} active series ({ALL_BIOMARKERS.length} available).</span>
        <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
          <ShieldCheck className="size-3.5" /> Green Band (0%–100%) = Normal Clinical Reference
        </span>
      </div>
    </Card>
  );
}
