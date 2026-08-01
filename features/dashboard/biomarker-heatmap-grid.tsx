'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Report } from '@/types';
import { Activity, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';

interface BiomarkerHeatmapGridProps {
  reports: Report[];
}

export function BiomarkerHeatmapGrid({ reports }: BiomarkerHeatmapGridProps) {
  // Sort reports chronologically oldest to newest (left to right)
  const sortedReports = React.useMemo(() => {
    return [...reports].sort(
      (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
    );
  }, [reports]);

  // Extract unique biomarker names
  const biomarkerNames = React.useMemo(() => {
    const names = new Set<string>();
    // Priority order for clean viewing
    const keyOrder = [
      'Haemoglobin', 'Total WBC', 'Total Platelet Count', 'ESR',
      'Sodium', 'Potassium', 'Chloride', 'Calcium',
      'Creatinine', 'Urea', 'Uric Acid', 'ALT/SGPT',
      'Glucose', 'HbA1c', 'Cholesterol', 'Triglycerides', 'Vitamin D'
    ];

    keyOrder.forEach((k) => names.add(k));

    sortedReports.forEach((r) => {
      r.tests.forEach((t) => names.add(t.name));
    });

    return Array.from(names);
  }, [sortedReports]);

  return (
    <Card className="shadow-xs border-border/80">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              Longitudinal Biomarker Status Heatmap <Layers className="h-4 w-4 text-primary" />
            </CardTitle>
            <CardDescription className="text-xs">
              Color-coded status matrix tracking all parameters across historical lab visit intervals.
            </CardDescription>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
              <span className="text-muted-foreground text-[11px]">Normal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-rose-500/20 border border-rose-500/40" />
              <span className="text-muted-foreground text-[11px]">Flagged</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-muted/40 border border-border/60" />
              <span className="text-muted-foreground text-[11px]">Not Tested</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 overflow-x-auto">
        <div className="min-w-[650px]">
          {/* Header Row: Date columns */}
          <div className="grid grid-cols-[180px_repeat(6,1fr)] gap-1.5 mb-2 border-b border-border/60 pb-2">
            <div className="text-xs font-bold text-muted-foreground uppercase font-mono tracking-wider">
              Biomarker
            </div>
            {sortedReports.map((report) => (
              <div key={report.id} className="text-center font-mono text-[11px] font-semibold text-foreground">
                <div>{report.formattedDate.split(' ')[0]} {report.formattedDate.split(' ')[1]}</div>
                <div className="text-[9px] text-muted-foreground font-normal truncate max-w-[80px] mx-auto">
                  {report.labName.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {biomarkerNames.map((name) => (
              <div
                key={name}
                className="grid grid-cols-[180px_repeat(6,1fr)] gap-1.5 items-center hover:bg-muted/20 p-1 rounded-md transition-colors"
              >
                <div className="text-xs font-medium truncate font-mono text-foreground">{name}</div>
                {sortedReports.map((report) => {
                  const test = report.tests.find(
                    (t) => t.name.toLowerCase().trim() === name.toLowerCase().trim()
                  );

                  if (!test) {
                    return (
                      <div
                        key={report.id}
                        className="h-8 rounded bg-muted/20 border border-border/30 flex items-center justify-center text-[10px] font-mono text-muted-foreground/40"
                      >
                        —
                      </div>
                    );
                  }

                  const isAbnormal = test.isAbnormal;

                  return (
                    <Tooltip key={report.id}>
                      <TooltipTrigger
                        render={
                          <div
                            className={`h-8 rounded flex items-center justify-center font-mono text-[11px] font-bold border transition-all cursor-pointer ${
                              isAbnormal
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                            }`}
                          >
                            {test.rawValue}
                          </div>
                        }
                      />
                      <TooltipContent className="text-xs font-mono space-y-1 p-2">
                        <div className="font-bold flex items-center gap-1.5">
                          {name}: {test.rawValue} {test.unit}
                          {isAbnormal ? (
                            <Badge variant="destructive" className="text-[9px] px-1 py-0">
                              Flagged
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0 text-emerald-600">
                              Normal
                            </Badge>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Date: {report.formattedDate} ({report.labName})
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Reference: {test.referenceRange || 'Standard'}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
