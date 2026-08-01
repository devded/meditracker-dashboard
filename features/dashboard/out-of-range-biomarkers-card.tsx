'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getReports } from '@/services/report-service';
import { Test } from '@/types';
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export function OutOfRangeBiomarkersCard() {
  const [abnormalTests, setAbnormalTests] = React.useState<Test[]>([]);

  React.useEffect(() => {
    getReports().then((reports) => {
      if (reports.length > 0) {
        // Collect out of range tests from latest report
        const latest = reports[0];
        const flagged = latest.tests.filter((t) => t.isAbnormal);
        setAbnormalTests(flagged);
      }
    });
  }, []);

  return (
    <Card className="col-span-full lg:col-span-1 shadow-xs border-border/80 flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            <CardTitle className="text-base font-semibold">Active Out-of-Range Values</CardTitle>
          </div>
          <Badge variant="destructive" className="font-mono text-[10px]">
            {abnormalTests.length} Flagged
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Biomarkers deviating from standard physiological reference limits.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        {abnormalTests.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-semibold text-foreground">All Biomarkers Within Range</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {abnormalTests.slice(0, 4).map((test) => (
              <div
                key={test.id}
                className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs font-bold text-foreground">{test.name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                    Ref: {test.referenceRange || 'Standard bounds'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400 block">
                    {test.rawValue} {test.unit}
                  </span>
                  <Badge variant="destructive" className="text-[9px] font-mono mt-0.5">
                    Flagged
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <div className="p-4 border-t border-border/60 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Action required</span>
        <Link href="/reports?filter=abnormal">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-primary p-0 h-auto">
            Inspect All Values <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
