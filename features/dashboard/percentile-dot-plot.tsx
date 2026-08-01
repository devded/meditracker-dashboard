'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Report } from '@/types';
import { parseReferenceRange } from '@/utils/parse-reference-range';
import { Target, Info } from 'lucide-react';

interface PercentileDotPlotProps {
  reports: Report[];
}

export function PercentileDotPlot({ reports }: PercentileDotPlotProps) {
  const latestReport = reports[0];

  const plotData = React.useMemo(() => {
    if (!latestReport) return [];

    const keyList = [
      'Sodium', 'Potassium', 'Chloride', 'Calcium', 'Magnesium',
      'Creatinine', 'Urea', 'Uric Acid', 'Haemoglobin', 'Glucose', 'HbA1c', 'Vitamin D'
    ];

    return keyList
      .map((name) => {
        const test = latestReport.tests.find((t) => t.name.toLowerCase().trim() === name.toLowerCase().trim());
        if (!test) return null;

        const bounds = parseReferenceRange(test.referenceRange);
        if (!bounds) return null;

        const val = test.value;
        const min = bounds.min;
        const max = bounds.max;

        // Calculate percentage position within min-max bounds (clamped 0-100%)
        let pct = 50;
        if (max > min) {
          pct = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
        }

        return {
          name: test.name,
          value: val,
          rawValue: test.rawValue,
          unit: test.unit,
          min,
          max,
          refStr: test.referenceRange,
          pct,
          isAbnormal: test.isAbnormal,
        };
      })
      .filter(Boolean);
  }, [latestReport]);

  if (plotData.length === 0) return null;

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              Reference Range Proximity & Target Dot Plot <Target className="h-4 w-4 text-primary" />
            </CardTitle>
            <CardDescription className="text-xs">
              Position of latest biomarker values relative to min–max safe physiological limits.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          {plotData.map((item: any) => (
            <div key={item.name} className="p-2.5 rounded-lg border border-border/60 bg-muted/10 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="font-bold font-mono text-foreground flex items-center gap-1.5">
                  <span>{item.name}</span>
                  <span className="text-muted-foreground font-normal text-[11px]">
                    ({item.rawValue} {item.unit})
                  </span>
                </div>
                <Badge variant={item.isAbnormal ? 'destructive' : 'secondary'} className="text-[9px] font-mono px-1.5 py-0">
                  {item.isAbnormal ? 'Flagged' : 'Normal'}
                </Badge>
              </div>

              {/* Range Track with Marker Dot */}
              <div className="relative pt-1 pb-1">
                <div className="h-2.5 w-full bg-emerald-500/20 rounded-full border border-emerald-500/30 relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 right-0 bg-emerald-500/10" />
                </div>

                {/* Dot Marker */}
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-background shadow-xs transition-all cursor-pointer ${
                          item.isAbnormal ? 'bg-rose-500 ring-2 ring-rose-500/30' : 'bg-emerald-500 ring-2 ring-emerald-500/30'
                        }`}
                        style={{ left: `calc(${item.pct}% - 8px)` }}
                      />
                    }
                  />
                  <TooltipContent className="text-xs font-mono">
                    <div>{item.name}: {item.rawValue} {item.unit}</div>
                    <div className="text-muted-foreground text-[10px]">Range: {item.min} – {item.max}</div>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                <span>Min: {item.min}</span>
                <span>Ref: {item.refStr}</span>
                <span>Max: {item.max}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
