'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Report } from '@/types';
import { ShieldCheck, Activity } from 'lucide-react';
import Link from 'next/link';

interface RevenueUpdatesChartProps {
  reports: Report[];
}

export function RevenueUpdatesChart({ reports }: RevenueUpdatesChartProps) {
  // Build clean positive bar chart data from reports
  const chartData = React.useMemo(() => {
    return [...reports]
      .sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime())
      .map((r) => {
        const normal = r.tests.filter((t) => !t.isAbnormal).length;
        const flagged = r.tests.filter((t) => t.isAbnormal).length;
        return {
          date: r.formattedDate.split(' ')[0] + ' ' + r.formattedDate.split(' ')[1],
          Normal: normal,
          Flagged: flagged,
        };
      });
  }, [reports]);

  const latestReport = reports[0];
  const abnormalCount = latestReport ? latestReport.tests.filter((t) => t.isAbnormal).length : 0;
  const normalCount = latestReport ? latestReport.tests.length - abnormalCount : 0;

  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Biomarker Status Trends</h3>
          <p className="text-xs text-muted-foreground">Longitudinal counts of normal vs flagged tests per visit</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            All Lab Visits ▾
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Clean Grouped Bar Chart */}
        <div className="lg:col-span-2 h-[220px] w-full">
          <ChartContainer
            config={{
              Normal: { label: 'Normal Biomarkers', color: '#10b981' },
              Flagged: { label: 'Flagged Biomarkers', color: '#f43f5e' },
            }}
            className="h-full w-full"
          >
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200/60 dark:stroke-slate-800" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-[10px] text-muted-foreground font-mono" />
              <YAxis tickLine={false} axisLine={false} className="text-[10px] text-muted-foreground font-mono" />
              <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
              <Bar dataKey="Normal" fill="#10b981" radius={[4, 4, 0, 0]} barSize={14} />
              <Bar dataKey="Flagged" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Right Medical Summary Column */}
        <div className="space-y-6 lg:border-l border-slate-200/80 dark:border-slate-800 lg:pl-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold font-mono text-foreground block">
                {latestReport?.tests.length || 28} Tests
              </span>
              <span className="text-xs text-muted-foreground font-medium">Total Parameters</span>
            </div>
          </div>

          <div className="space-y-3 text-xs font-medium">
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Normal</span>
              </div>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{normalCount}</span>
            </div>

            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-rose-500" />
                <span className="text-muted-foreground">Flagged</span>
              </div>
              <span className="font-extrabold text-rose-600 dark:text-rose-400 font-mono">{abnormalCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <Link href="/reports">
          <Button className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-xs font-bold shadow-xs transition-colors">
            View Full Diagnostic Report
          </Button>
        </Link>
      </div>
    </Card>
  );
}
