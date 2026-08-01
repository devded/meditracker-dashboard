'use client';

import * as React from 'react';
import { getReports, getDashboardStats } from '@/services/report-service';
import { Report, DashboardStats } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

// Import shadcnspace dashboard components
import { ValueStatCards } from '@/features/dashboard/stat-cards';
import { BiomarkerTimelineChart } from '@/features/dashboard/biomarker-timeline-chart';
import { BiomarkerComparisonRangeChart } from '@/features/dashboard/biomarker-comparison-range-chart';
import { RevenueUpdatesChart } from '@/features/dashboard/revenue-updates-chart';
import { MonthlyEarningsChart } from '@/features/dashboard/monthly-earnings-chart';
import { YearlyBackupDonut } from '@/features/dashboard/yearly-backup-donut';
import { RecentTransactionsList } from '@/features/dashboard/recent-transactions-list';
import { BiomarkerHeatmapGrid } from '@/features/dashboard/biomarker-heatmap-grid';
import { TopCampaignsTable } from '@/features/dashboard/top-campaigns-table';
import { SparklineParameterCards } from '@/features/dashboard/sparkline-parameter-cards';
import { ClinicalInsightsSection } from '@/features/dashboard/clinical-insights-section';

export default function DashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([getDashboardStats(), getReports()]).then(([statsData, reportsData]) => {
      setStats(statsData);
      setReports(reportsData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[300px] md:col-span-2 rounded-3xl" />
          <Skeleton className="h-[300px] rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Row: Hero Telemetry Card (2 cols) + Optimal Card (1 col) + Flagged Card (1 col) */}
      {stats && <ValueStatCards stats={stats} reports={reports} />}

      {/* Requested Feature Section 1: Biomarker Timeline Chart */}
      <BiomarkerTimelineChart reports={reports} />

      {/* Requested Feature Section 2: Biomarker Comparison Chart with Green Reference Band (0-100%) */}
      <BiomarkerComparisonRangeChart reports={reports} />

      {/* Second Row: Biomarker Range Updates (2 cols) + Overall Health Score & Organ System Donut (1 col stack) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueUpdatesChart reports={reports} />
        </div>
        <div className="space-y-6">
          <MonthlyEarningsChart />
          <YearlyBackupDonut />
        </div>
      </div>

      {/* Third Row: Biomarker Status Heatmap Grid (2 cols) + Recent Diagnostic Reports List (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BiomarkerHeatmapGrid reports={reports} />
        </div>
        <div>
          <RecentTransactionsList reports={reports} />
        </div>
      </div>

      {/* Fourth Row: Biomarker Reference Range Proximity Table */}
      <TopCampaignsTable />

      {/* Fifth Row: Embedded Sparklines Parameter Cards */}
      <SparklineParameterCards reports={reports} />

      {/* Sixth Row: Automated Clinical Observations */}
      <ClinicalInsightsSection reports={reports} />
    </div>
  );
}
