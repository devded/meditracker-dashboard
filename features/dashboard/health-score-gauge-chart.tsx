'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { Report } from '@/types';
import { ShieldCheck, Heart, Sparkles, Activity } from 'lucide-react';

interface HealthScoreGaugeChartProps {
  reports: Report[];
}

export function HealthScoreGaugeChart({ reports }: HealthScoreGaugeChartProps) {
  const latestReport = reports[0];

  const scoreData = React.useMemo(() => {
    if (!latestReport || latestReport.tests.length === 0) {
      return { score: 100, normal: 0, total: 0, status: 'Optimal' };
    }
    const total = latestReport.tests.length;
    const normal = latestReport.tests.filter((t) => !t.isAbnormal).length;
    const score = Math.round((normal / total) * 100);

    let status = 'Optimal';
    let color = 'hsl(160 60% 45%)'; // Emerald
    if (score < 70) {
      status = 'Requires Attention';
      color = 'hsl(350 89% 60%)'; // Red
    } else if (score < 85) {
      status = 'Moderate Balance';
      color = 'hsl(38 92% 50%)'; // Amber
    }

    return { score, normal, total, status, color };
  }, [latestReport]);

  const chartData = [
    { name: 'Health Score', value: scoreData.score, fill: scoreData.color },
  ];

  return (
    <Card className="shadow-xs border-border/80 h-full flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            Overall Health Score <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardTitle>
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {scoreData.status}
          </span>
        </div>
        <CardDescription className="text-xs">
          Calculated from {scoreData.normal} of {scoreData.total} biomarkers in physiological range.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-center pt-0 relative pb-4">
        <div className="h-[180px] w-full flex items-center justify-center relative">
          <ChartContainer
            config={{
              score: { label: 'Score', color: scoreData.color },
            }}
            className="h-[170px] w-[170px]"
          >
            <RadialBarChart
              innerRadius="75%"
              outerRadius="100%"
              data={chartData}
              startAngle={180}
              endAngle={0}
              barSize={16}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background={{ fill: 'var(--muted)' }}
                dataKey="value"
                cornerRadius={10}
                fill={scoreData.color}
              />
            </RadialBarChart>
          </ChartContainer>

          {/* Center Score Text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 text-center">
            <div className="text-3xl font-extrabold font-mono text-foreground tracking-tight">
              {scoreData.score}%
            </div>
            <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider font-semibold">
              Optimal Index
            </div>
          </div>
        </div>

        {/* Footer pill statistics */}
        <div className="grid grid-cols-2 gap-2 w-full text-center mt-2 border-t border-border/50 pt-3 text-xs font-mono">
          <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
            <span className="text-muted-foreground block text-[10px]">Normal Biomarkers</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{scoreData.normal}</span>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <span className="text-muted-foreground block text-[10px]">Flagged Biomarkers</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{scoreData.total - scoreData.normal}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
