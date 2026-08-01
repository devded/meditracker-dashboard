'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer } from '@/components/ui/chart';
import { LineChart, Line } from 'recharts';
import { Report } from '@/types';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SparklineParameterCardsProps {
  reports: Report[];
}

export function SparklineParameterCards({ reports }: SparklineParameterCardsProps) {
  const sortedReports = React.useMemo(() => {
    return [...reports].sort(
      (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
    );
  }, [reports]);

  const KEY_BIOMARKERS = [
    { name: 'Haemoglobin', label: 'Hemoglobin', category: 'Blood Work' },
    { name: 'Total Platelet Count', label: 'Platelet Count', category: 'Blood Work' },
    { name: 'Total WBC', label: 'WBC Count', category: 'Blood Work' },
    { name: 'Sodium', label: 'Serum Sodium', category: 'Electrolytes' },
    { name: 'Potassium', label: 'Serum Potassium', category: 'Electrolytes' },
    { name: 'Calcium', label: 'Serum Calcium', category: 'Electrolytes' },
    { name: 'Creatinine', label: 'Serum Creatinine', category: 'Kidney' },
    { name: 'ALT/SGPT', label: 'ALT (SGPT)', category: 'Liver' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold tracking-tight flex items-center gap-2 text-foreground font-sans">
            Key Biomarker Trajectories <Activity className="size-4 text-emerald-600 dark:text-emerald-400" />
          </h3>
          <p className="text-xs text-muted-foreground">
            Live parameter values with embedded mini trend sparklines across historical lab visits
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KEY_BIOMARKERS.map((bm) => {
          const history = sortedReports
            .map((r) => {
              const test = r.tests.find((t) => t.name.toLowerCase().trim() === bm.name.toLowerCase().trim());
              return test ? { date: r.formattedDate, value: test.value, rawValue: test.rawValue, unit: test.unit, isAbnormal: test.isAbnormal, refRange: test.referenceRange } : null;
            })
            .filter(Boolean) as any[];

          if (history.length === 0) return null;

          const latest = history[history.length - 1];
          const previous = history.length > 1 ? history[history.length - 2] : null;

          let TrendIcon = Minus;
          let trendColor = 'text-muted-foreground';
          if (previous) {
            if (latest.value > previous.value) {
              TrendIcon = TrendingUp;
              trendColor = latest.isAbnormal ? 'text-rose-500' : 'text-emerald-500';
            } else if (latest.value < previous.value) {
              TrendIcon = TrendingDown;
              trendColor = latest.isAbnormal ? 'text-emerald-500' : 'text-rose-500';
            }
          }

          const strokeColor = latest.isAbnormal ? '#f43f5e' : '#10b981';

          return (
            <Card key={bm.name} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 space-y-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-semibold tracking-wider">
                  {bm.category}
                </span>
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    latest.isAbnormal
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  }`}
                >
                  {latest.isAbnormal ? 'Flagged' : 'Normal'}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-foreground truncate">{bm.label}</h4>
                <div className="flex items-baseline justify-between mt-1">
                  <div>
                    <span className="text-xl font-extrabold font-mono text-foreground">{latest.rawValue}</span>
                    <span className="text-[11px] text-muted-foreground font-mono ml-1">{latest.unit}</span>
                  </div>
                  <TrendIcon className={`size-4 ${trendColor}`} />
                </div>
              </div>

              {/* Mini Sparkline Chart */}
              <div className="h-[36px] w-full pt-1">
                <ChartContainer config={{ val: { label: bm.label, color: strokeColor } }} className="h-full w-full">
                  <LineChart data={history} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={strokeColor}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ChartContainer>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-[10px] font-mono text-muted-foreground">
                <span>Ref: {latest.refRange || 'Standard'}</span>
                <span>{history.length} Visits</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
