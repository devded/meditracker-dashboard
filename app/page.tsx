'use client';

import * as React from 'react';
import { getReports } from '@/services/report-service';
import { Report } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

// Import requested dashboard charts
import { BiomarkerTimelineChart } from '@/features/dashboard/biomarker-timeline-chart';
import { BiomarkerComparisonRangeChart } from '@/features/dashboard/biomarker-comparison-range-chart';

export default function DashboardPage() {
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getReports().then((reportsData) => {
      setReports(reportsData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[320px] w-full rounded-3xl" />
        <Skeleton className="h-[380px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Biomarker Timeline Chart */}
      <BiomarkerTimelineChart reports={reports} />

      {/* 2. Biomarker Comparison Chart */}
      <BiomarkerComparisonRangeChart reports={reports} />
    </div>
  );
}
