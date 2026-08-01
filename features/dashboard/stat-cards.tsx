'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowRight, Calendar, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { DashboardStats, Report } from '@/types';
import Link from 'next/link';

interface ValueStatCardsProps {
  stats: DashboardStats;
  reports: Report[];
}

export function ValueStatCards({ stats, reports }: ValueStatCardsProps) {
  const latestReport = reports[0];
  const abnormalTests = latestReport ? latestReport.tests.filter((t) => t.isAbnormal) : [];
  const normalCount = latestReport ? latestReport.tests.length - abnormalTests.length : 0;
  const optimalRatio = latestReport ? Math.round((normalCount / latestReport.tests.length) * 100) : 100;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      {/* Card 1: Hero Telemetry Card (Spans 2 Columns in shadcnspace design) */}
      <Card className="lg:col-span-2 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 z-10">
            <h2 className="text-xl font-bold tracking-tight text-foreground font-sans">
              Biomarker Telemetry Dashboard
            </h2>
            <p className="text-xs text-muted-foreground">
              Longitudinal health overview & diagnostic tracking
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-6 z-10">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-xs text-muted-foreground block font-medium">Optimal Biomarkers</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-extrabold font-mono text-foreground">{optimalRatio}%</span>
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  +18%
                </span>
              </div>
            </div>

            <div className="h-10 w-px bg-border/60" />

            <div>
              <span className="text-xs text-muted-foreground block font-medium">Flagged Biomarkers</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-extrabold font-mono text-foreground">{abnormalTests.length}</span>
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                  -5%
                </span>
              </div>
            </div>
          </div>

          {/* Medical Doctor / Scientist Workstation SVG Illustration */}
          <div className="relative shrink-0 hidden sm:block">
            <svg width="180" height="110" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="30" y="85" width="140" height="8" rx="4" fill="#0f172a" opacity="0.8" />
              <rect x="40" y="93" width="6" height="25" fill="#0f172a" />
              <rect x="154" y="93" width="6" height="25" fill="#0f172a" />
              <circle cx="100" cy="35" r="16" fill="#0f172a" />
              <path d="M100 23C93 23 88 28 88 35H112C112 28 107 23 100 23Z" fill="#0d9488" />
              <path d="M82 60C82 50 90 48 100 48C110 48 118 50 118 60V85H82V60Z" fill="#0284c7" />
              {/* Stethoscope Accent */}
              <path d="M92 50C92 56 108 56 108 50" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
              <circle cx="104" cy="58" r="4" fill="#f59e0b" />
              {/* Laptop Screen */}
              <rect x="120" y="65" width="30" height="20" rx="3" fill="#0f172a" />
              <path d="M125 72L132 78L145 70" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </Card>

      {/* Card 2: Optimal Biomarkers Card (1 Col) */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Optimal Biomarkers</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-extrabold font-mono text-foreground">{optimalRatio}%</span>
              <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                +18%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{normalCount} of {latestReport?.tests.length || 0} tests in target range</p>
          </div>
          <div className="size-10 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-5" />
          </div>
        </div>

        <div className="pt-6">
          <Link href="/history">
            <button className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-foreground transition-colors shadow-2xs">
              See Report <ArrowRight className="size-3.5" />
            </button>
          </Link>
        </div>
      </Card>

      {/* Card 3: Flagged Biomarkers Card (1 Col) */}
      <Card className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Flagged Biomarkers</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-extrabold font-mono text-foreground">{abnormalTests.length}</span>
              <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                -5%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Require clinical observation</p>
          </div>
          <div className="size-10 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-rose-500">
            <AlertTriangle className="size-5" />
          </div>
        </div>

        <div className="pt-6">
          <Link href="/reports?filter=abnormal">
            <button className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-foreground transition-colors shadow-2xs">
              See Report <ArrowRight className="size-3.5" />
            </button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
