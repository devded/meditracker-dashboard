'use client';

import * as React from 'react';
import { getReports } from '@/services/report-service';
import { Report } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';

// Import requests dashboard charts
import { BiomarkerTimelineChart } from '@/features/dashboard/biomarker-timeline-chart';
import { BiomarkerComparisonRangeChart } from '@/features/dashboard/biomarker-comparison-range-chart';

const QUICK_BIOMARKERS = [
  'Cholesterol',
  'Glucose',
  'Creatinine',
  'Haemoglobin',
  'ALT/SGPT',
  'Triglycerides',
  'Vitamin D',
  'Total WBC',
];

export default function DashboardPage() {
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeBiomarker, setActiveBiomarker] = React.useState('Cholesterol');

  React.useEffect(() => {
    getReports().then((reportsData) => {
      setReports(reportsData);
      setLoading(false);
    });
  }, []);

  const stats = React.useMemo(() => {
    if (!reports || reports.length === 0) {
      return { totalTests: 0, normalCount: 0, abnormalCount: 0, latestDate: 'N/A', pctNormal: 100 };
    }

    let normal = 0;
    let abnormal = 0;
    const testNames = new Set<string>();

    reports.forEach((r) => {
      r.tests.forEach((t) => {
        testNames.add(t.name);
        if (t.isAbnormal) abnormal++;
        else normal++;
      });
    });

    const total = normal + abnormal;
    const pct = total > 0 ? Math.round((normal / total) * 100) : 100;
    const sorted = [...reports].sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());

    return {
      totalBiomarkers: testNames.size,
      totalTests: total,
      normalCount: normal,
      abnormalCount: abnormal,
      latestDate: sorted[0]?.formattedDate || 'N/A',
      latestLab: sorted[0]?.labName || 'N/A',
      reportCount: reports.length,
      pctNormal: pct,
    };
  }, [reports]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-3xl" />
        <Skeleton className="h-[320px] w-full rounded-3xl" />
        <Skeleton className="h-[380px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Dashboard Header & Clinical Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground font-sans">
            Biomarker Analytics & Trends <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Longitudinal health monitoring, parameter timelines, and normalized reference comparisons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs px-3 py-1 rounded-full border-slate-200 dark:border-slate-800 text-foreground">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" /> Latest: {stats.latestDate}
          </Badge>
          <Badge variant="secondary" className="font-mono text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-none font-bold">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" /> {stats.pctNormal}% Optimal
          </Badge>
        </div>
      </div>

      {/* 2. Quick Vital Overview Summary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Monitored Biomarkers</span>
            <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center">
              <Zap className="size-4 text-amber-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-foreground">{stats.totalBiomarkers}</span>
            <span className="text-xs font-mono text-muted-foreground font-medium">Unique Parameters</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{stats.normalCount} Normal</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">{stats.abnormalCount} Flagged</span>
          </div>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Health Status Index</span>
            <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{stats.pctNormal}%</span>
            <span className="text-xs font-mono text-muted-foreground font-medium">In Reference Range</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground font-medium truncate">
            Based on {stats.totalTests} quantitative observations
          </p>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Latest Diagnostic Visit</span>
            <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-foreground flex items-center justify-center">
              <Calendar className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-extrabold font-mono text-foreground">{stats.latestDate}</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground font-medium truncate">
            {stats.latestLab}
          </p>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Lab Report Archives</span>
            <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-foreground flex items-center justify-center">
              <FileText className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-foreground">{stats.reportCount}</span>
            <span className="text-xs font-mono text-muted-foreground font-medium">Uploaded Reports</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground font-medium">
            Complete longitudinal history
          </p>
        </Card>
      </div>

      {/* 3. Quick Biomarker Selector Bar */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs rounded-3xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground font-sans flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" /> Quick Select Biomarker Timeline:
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">Click to load in timeline</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {QUICK_BIOMARKERS.map((name) => {
            const isActive = activeBiomarker === name;
            return (
              <button
                key={name}
                onClick={() => setActiveBiomarker(name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 4. Biomarker Timeline Chart */}
      <BiomarkerTimelineChart
        reports={reports}
        selectedBiomarker={activeBiomarker}
        onSelectBiomarker={(b) => setActiveBiomarker(b)}
      />

      {/* 5. Biomarker Comparison Chart */}
      <BiomarkerComparisonRangeChart reports={reports} />
    </div>
  );
}
