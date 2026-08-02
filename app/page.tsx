'use client';

import * as React from 'react';
import { getReports } from '@/services/report-service';
import { Report } from '@/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Calendar,
  FileText,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  User,
} from 'lucide-react';
import { usePatientUuid } from '@/lib/patient-uuid';

// Import requests dashboard charts
import { BiomarkerTimelineChart } from '@/features/dashboard/biomarker-timeline-chart';
import { BiomarkerComparisonRangeChart } from '@/features/dashboard/biomarker-comparison-range-chart';

// Preferred ordering only — the actual chips are derived from the patient's own reports.
const PREFERRED_BIOMARKERS = [
  'Cholesterol',
  'Glucose',
  'Creatinine',
  'Haemoglobin',
  'ALT/SGPT',
  'Triglycerides',
  'Vitamin D',
  'Total WBC',
];

const QUICK_BIOMARKER_LIMIT = 8;

export default function DashboardPage() {
  const [patientUuid] = usePatientUuid();
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeBiomarker, setActiveBiomarker] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    getReports(patientUuid).then((reportsData) => {
      setReports(reportsData);
      setLoading(false);
    });
  }, [patientUuid]);

  // Quick-select chips built from the biomarkers this patient actually has,
  // ordered by preferred clinical panel first, then by how often they recur across reports.
  const { quickBiomarkers, allBiomarkerNames } = React.useMemo(() => {
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      r.tests.forEach((t) => {
        counts[t.name] = (counts[t.name] || 0) + 1;
      });
    });

    const available = Object.keys(counts);
    const preferred = PREFERRED_BIOMARKERS.filter((name) => available.includes(name));
    const rest = available
      .filter((name) => !preferred.includes(name))
      .sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));

    const ordered = [...preferred, ...rest];
    return {
      quickBiomarkers: ordered.slice(0, QUICK_BIOMARKER_LIMIT),
      allBiomarkerNames: ordered,
    };
  }, [reports]);

  // Resolve during render so the selection always points at a biomarker the patient
  // actually has — validated against ALL biomarkers, not just the quick-chip subset,
  // so dropdown selections outside the top-8 chips are preserved.
  const selectedBiomarker =
    activeBiomarker && allBiomarkerNames.includes(activeBiomarker)
      ? activeBiomarker
      : quickBiomarkers[0] ?? '';

  const stats = React.useMemo(() => {
    if (!reports || reports.length === 0) {
      return { totalTests: 0, normalCount: 0, abnormalCount: 0, latestDate: 'N/A', pctNormal: 100, abnormalNames: [] };
    }

    let normal = 0;
    let abnormal = 0;
    const testNames = new Set<string>();
    const abnormalTestNames = new Set<string>();

    reports.forEach((r) => {
      r.tests.forEach((t) => {
        testNames.add(t.name);
        if (t.isAbnormal) {
          abnormal++;
          abnormalTestNames.add(t.name);
        } else {
          normal++;
        }
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
      abnormalNames: Array.from(abnormalTestNames),
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

  const topAbnormalText = stats.abnormalNames.length > 0
    ? stats.abnormalNames.slice(0, 3).join(' • ')
    : 'All parameters in optimal range';

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Dashboard Header & Clinical Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground font-sans">
            Biomarker Analytics & Trends <Activity className="h-5 w-5 text-emerald-500" />
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Longitudinal health monitoring & Cloud Firestore records mapped to Patient UUID: <span className="font-mono font-bold text-foreground">{patientUuid}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs px-3 py-1 rounded-full border-zinc-200 dark:border-zinc-800 text-foreground">
            <User className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> Patient: {patientUuid}
          </Badge>
          <Badge variant="secondary" className="font-mono text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-bold">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" /> {stats.pctNormal}% Optimal
          </Badge>
        </div>
      </div>

      {/* 2. Informative Clinical Overview Summary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Out-of-Range Flags */}
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-xs rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Out-of-Range Flags</span>
            <div className="size-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-rose-500">{stats.abnormalCount}</span>
            <span className="text-xs font-mono text-muted-foreground font-medium">Require Focus</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground font-mono font-medium truncate" title={topAbnormalText}>
            {topAbnormalText}
          </p>
        </Card>

        {/* KPI 2: Biomarker Stability Trajectory */}
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-xs rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Biomarker Stability Trajectory</span>
            <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-emerald-500">{stats.pctNormal}%</span>
            <span className="text-xs font-mono text-muted-foreground font-medium">In Target Range</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground font-medium truncate">
            <span className="text-emerald-500 font-bold">{stats.normalCount} Normalizing</span> • <span className="text-rose-500 font-bold">{stats.abnormalCount} Need Review</span>
          </p>
        </Card>

        {/* KPI 3: Latest Diagnostic Visit */}
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-xs rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Latest Diagnostic Visit</span>
            <div className="size-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-foreground flex items-center justify-center">
              <Calendar className="size-4 text-emerald-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-extrabold font-mono text-foreground">{stats.latestDate}</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground font-medium truncate">
            {stats.latestLab}
          </p>
        </Card>

        {/* KPI 4: Lab Report Archives */}
        <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-xs rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Lab Report Archives</span>
            <div className="size-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-foreground flex items-center justify-center">
              <FileText className="size-4 text-emerald-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-foreground">{stats.reportCount}</span>
            <span className="text-xs font-mono text-muted-foreground font-medium">Reports Processed</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground font-medium">
            {stats.totalTests} quantitative observations
          </p>
        </Card>
      </div>

      {/* 3. Quick Biomarker Selector Bar */}
      <Card className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 p-4 shadow-xs rounded-3xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground font-sans flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-emerald-500" /> Quick Select Biomarker Timeline:
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">Click to load in timeline</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {quickBiomarkers.length === 0 && (
            <span className="text-[11px] font-mono text-muted-foreground">
              No biomarkers recorded yet — upload a report to populate the timeline.
            </span>
          )}
          {quickBiomarkers.map((name) => {
            const isActive = selectedBiomarker === name;
            return (
              <button
                key={name}
                onClick={() => setActiveBiomarker(name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xs font-bold'
                    : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
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
        selectedBiomarker={selectedBiomarker}
        onSelectBiomarker={(b) => setActiveBiomarker(b)}
      />

      {/* 5. Biomarker Comparison Chart */}
      <BiomarkerComparisonRangeChart reports={reports} />
    </div>
  );
}
