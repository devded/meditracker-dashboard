'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { AreaChart, Area } from 'recharts';
import { Heart } from 'lucide-react';

export function MonthlyEarningsChart() {
  const chartData = [
    { month: 'Jan', val: 78 },
    { month: 'Feb', val: 82 },
    { month: 'Mar', val: 80 },
    { month: 'Apr', val: 88 },
    { month: 'May', val: 85 },
    { month: 'Jun', val: 94 },
  ];

  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Overall Health Score</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-extrabold font-mono text-foreground">94%</span>
            <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              +4% <span className="text-[10px] text-muted-foreground font-normal">vs last visit</span>
            </span>
          </div>
        </div>
        <div className="size-10 rounded-full border border-slate-200 dark:border-slate-800 bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500">
          <Heart className="size-5" />
        </div>
      </div>

      {/* Smooth Area Chart matching shadcnspace 1:1 */}
      <div className="h-[90px] w-full pt-4">
        <ChartContainer
          config={{
            val: { label: 'Health Score', color: '#0f172a' },
          }}
          className="h-full w-full"
        >
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="monochromeHealthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="val"
              stroke="#0d9488"
              strokeWidth={2.5}
              fill="url(#monochromeHealthGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </Card>
  );
}
