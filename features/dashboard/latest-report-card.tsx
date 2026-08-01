'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowRight, CheckCircle, AlertCircle, Stethoscope } from 'lucide-react';
import { Report } from '@/types';
import Link from 'next/link';

interface LatestReportCardProps {
  report: Report | null;
}

export function LatestReportCard({ report }: LatestReportCardProps) {
  if (!report) {
    return (
      <Card className="col-span-full lg:col-span-2 shadow-xs border-border/80 p-6 text-center text-muted-foreground">
        No medical reports available.
      </Card>
    );
  }

  const abnormalCount = report.tests.filter((t) => t.isAbnormal).length;
  const normalCount = report.tests.length - abnormalCount;

  return (
    <Card className="col-span-full lg:col-span-2 shadow-xs border-border/80 flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">Latest Diagnostic Report Summary</CardTitle>
          </div>
          <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
            {report.formattedDate}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Issued by {report.labName} · Attending Physician: {report.doctorName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick metrics row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-[10px] uppercase font-mono text-emerald-600 dark:text-emerald-400">Normal Tests</p>
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{normalCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
            <p className="text-[10px] uppercase font-mono text-rose-600 dark:text-rose-400">Abnormal Flags</p>
            <p className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">{abnormalCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
            <p className="text-[10px] uppercase font-mono text-primary">Total Tests</p>
            <p className="text-xl font-bold font-mono text-primary mt-0.5">{report.tests.length}</p>
          </div>
        </div>

        {/* Clinical Summary Callout */}
        <div className="rounded-xl bg-muted/60 p-3.5 border border-border/60 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Stethoscope className="h-4 w-4 text-primary" />
            <span>Physician Clinical Summary</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {report.clinicalSummary}
          </p>
        </div>
      </CardContent>

      <div className="p-4 border-t border-border/60 flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-mono">Report ID: {report.id}</span>
        <Link href={`/reports/${report.id}`}>
          <Button size="sm" className="gap-1.5 text-xs">
            View Full Report Breakdown <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
