'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Report } from '@/types';

interface ActiveLanesQueueProps {
  reports: Report[];
}

export function ActiveLanesQueue({ reports }: ActiveLanesQueueProps) {
  const latestReport = reports[0];

  const abnormalLanes = React.useMemo(() => {
    if (!latestReport) return [];

    const abnormal = latestReport.tests.filter((t) => t.isAbnormal);

    return abnormal.map((t, idx) => {
      // Scale severity percentage for progress bar
      let pct = 60 + idx * 10;
      if (t.name.includes('Platelet')) pct = 92;
      if (t.name.includes('Glucose')) pct = 64;
      if (t.name.includes('Potassium')) pct = 58;
      if (t.name.includes('HbA1c')) pct = 48;
      if (t.name.includes('Creatinine')) pct = 36;

      const dotColor = pct > 80 ? 'bg-red-500' : 'bg-amber-500';
      const barColor = pct > 80 ? 'bg-red-500' : 'bg-amber-500';

      return {
        id: `0${idx}`,
        name: t.name,
        category: t.category,
        value: `${t.rawValue} ${t.unit}`,
        pct,
        dotColor,
        barColor,
      };
    });
  }, [latestReport]);

  return (
    <div
      data-slot="card"
      className="group/card relative flex flex-col gap-4 overflow-hidden rounded-xl bg-card text-sm text-card-foreground ring-1 ring-foreground/10 p-0 h-full"
    >
      <span aria-hidden="true" className="absolute top-0 left-0 size-2 border-t border-l border-foreground/65 z-10" />
      <span aria-hidden="true" className="absolute right-0 bottom-0 size-2 border-r border-b border-foreground/65 z-10" />

      <div className="space-y-5 p-4">
        <div className="space-y-0.5">
          <h2 className="text-sm leading-4 font-semibold text-foreground">Active Lanes</h2>
          <p className="text-xs leading-4 text-muted-foreground font-mono">Biomarker Threat Queue</p>
        </div>

        <div className="space-y-4">
          {abnormalLanes.map((lane) => (
            <div key={lane.id} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-0.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`size-2 shrink-0 rounded-full ${lane.dotColor}`} aria-hidden="true" />
                    <span className="truncate text-xs font-semibold font-mono text-foreground">
                      [{lane.id}] {lane.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                    <span>{lane.category}</span>
                    <span aria-hidden="true" className="size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                    <span>Elevated</span>
                  </div>
                </div>
                <div className="text-right text-xs font-semibold tabular-nums font-mono text-foreground">
                  {lane.value}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${lane.barColor}`} style={{ width: `${lane.pct}%` }} />
                </div>
                <span className="w-8 text-right text-[10px] leading-none text-muted-foreground font-mono tabular-nums">
                  {lane.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
