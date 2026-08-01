'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

export function YearlyBackupDonut() {
  const chartData = [
    { name: 'Hematology', value: 55, color: '#0d9488' }, // Teal
    { name: 'Electrolytes', value: 25, color: '#0f172a' }, // Dark Gray
    { name: 'Renal & Hepatic', value: 20, color: '#ea580c' }, // Orange
  ];

  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Organ System Distribution</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-extrabold font-mono text-foreground">6 Systems</span>
            <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              100% <span className="text-[10px] text-muted-foreground font-normal">monitored</span>
            </span>
          </div>
        </div>

        {/* Thick Donut Chart matching shadcnspace 1:1 */}
        <div className="size-[100px] shrink-0">
          <ChartContainer
            config={{
              val: { label: 'Distribution', color: '#0d9488' },
            }}
            className="h-full w-full"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={chartData}
                innerRadius={30}
                outerRadius={45}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-semibold pt-4 border-t border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#0d9488]" />
          <span className="text-muted-foreground">Hematology</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#0f172a] dark:bg-slate-200" />
          <span className="text-muted-foreground">Electrolytes</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#ea580c]" />
          <span className="text-muted-foreground">Renal</span>
        </div>
      </div>
    </Card>
  );
}
