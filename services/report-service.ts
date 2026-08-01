import { RAW_MOCK_REPORTS } from '@/mock/reports';
import { mapReport } from '@/utils/map-report';
import { Report, BiomarkerTrendPoint, DashboardStats, InsightCardData } from '@/types';

// Map raw reports to UI models and sort chronologically (newest first for general listing)
const mappedReports: Report[] = RAW_MOCK_REPORTS.map((raw) => mapReport(raw, raw.id)).sort(
  (a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
);

/**
 * Fetch all medical reports.
 */
export async function getReports(): Promise<Report[]> {
  // Simulate tiny async latency clean seam
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mappedReports]), 50);
  });
}

/**
 * Fetch a single report by ID.
 */
export async function getReportById(id: string): Promise<Report | null> {
  return new Promise((resolve) => {
    const report = mappedReports.find((r) => r.id === id);
    setTimeout(() => resolve(report ? { ...report } : null), 50);
  });
}

/**
 * Get overall dashboard overview stats.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const reports = await getReports();
  let totalTests = 0;
  let abnormalTests = 0;
  const categoriesSet = new Set<string>();

  reports.forEach((report) => {
    report.tests.forEach((test) => {
      totalTests += 1;
      if (test.isAbnormal) abnormalTests += 1;
      categoriesSet.add(test.category);
    });
  });

  return {
    totalReports: reports.length,
    totalTests,
    abnormalTests,
    categoriesCount: categoriesSet.size,
    latestReport: reports.length > 0 ? reports[0] : null,
  };
}

/**
 * Extract time-series values for a given biomarker across all reports.
 * Returns sorted oldest to newest for charts.
 */
export async function getBiomarkerHistory(testName: string): Promise<BiomarkerTrendPoint[]> {
  const reports = await getReports();
  // Oldest first for line chart progression
  const sortedReports = [...reports].sort(
    (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
  );

  const history: BiomarkerTrendPoint[] = [];

  sortedReports.forEach((report) => {
    const matchingTest = report.tests.find(
      (t) => t.name.toLowerCase().trim() === testName.toLowerCase().trim()
    );

    if (matchingTest) {
      history.push({
        date: report.reportDate,
        formattedDate: report.formattedDate,
        labName: report.labName,
        value: matchingTest.value,
        rawValue: matchingTest.rawValue,
        unit: matchingTest.unit,
        isAbnormal: matchingTest.isAbnormal,
        referenceRange: matchingTest.referenceRange,
      });
    }
  });

  return history;
}

/**
 * List all unique shared biomarkers available for timeline analysis.
 */
export async function getAvailableBiomarkers(): Promise<string[]> {
  const reports = await getReports();
  const testCounts: Record<string, number> = {};

  reports.forEach((r) => {
    r.tests.forEach((t) => {
      testCounts[t.name] = (testCounts[t.name] || 0) + 1;
    });
  });

  // Return biomarkers that appear in 2 or more reports
  return Object.keys(testCounts)
    .filter((name) => testCounts[name] >= 2 && name.toLowerCase() !== 'others')
    .sort();
}

/**
 * Category counts across all reports for pie chart distribution.
 */
export async function getCategoryDistribution(): Promise<{ category: string; count: number; fill: string }[]> {
  const reports = await getReports();
  const counts: Record<string, number> = {};

  reports.forEach((r) => {
    r.tests.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
  });

  const colors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ];

  return Object.entries(counts).map(([category, count], idx) => ({
    category,
    count,
    fill: colors[idx % colors.length],
  }));
}

/**
 * Abnormal count per report for bar chart trend.
 */
export async function getAbnormalTrendByReport(): Promise<{ date: string; lab: string; total: number; abnormal: number; normal: number }[]> {
  const reports = await getReports();
  // Oldest first for trend
  const sorted = [...reports].sort(
    (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
  );

  return sorted.map((r) => {
    const abnormal = r.tests.filter((t) => t.isAbnormal).length;
    const normal = r.tests.length - abnormal;
    return {
      date: r.formattedDate,
      lab: r.labName.split(' ')[0], // short lab name
      total: r.tests.length,
      abnormal,
      normal,
    };
  });
}

/**
 * Generate plain-language descriptive insights (non-diagnostic).
 */
export async function getInsights(): Promise<InsightCardData[]> {
  return [
    {
      id: 'ins-1',
      title: 'Platelet Count Recovery Trend',
      biomarker: 'Total Platelet Count',
      status: 'improving',
      trend: 'up',
      changeText: 'Recovered from 70,000 to 220,000 /Cmm',
      description: 'Your platelet counts show a healthy upward recovery trajectory from previous post-viral thrombocytopenia, now comfortably within standard reference limits.',
      latestValue: '220,000 /Cmm',
      referenceRange: '1,50,000-4,50,000',
      category: 'Hematology',
    },
    {
      id: 'ins-2',
      title: 'Vitamin D Sufficiency Achieved',
      biomarker: 'Vitamin D',
      status: 'improving',
      trend: 'up',
      changeText: 'Increased from 18 ng/ml to 45 ng/ml',
      description: 'Vitamin D 25-OH serum levels have steadily elevated over the past 9 months and are currently in the optimal sufficiency range.',
      latestValue: '45 ng/ml',
      referenceRange: '30-100 ng/ml',
      category: 'Hormone',
    },
    {
      id: 'ins-3',
      title: 'Inflammatory Markers (ESR) Normalized',
      biomarker: 'ESR',
      status: 'stable',
      trend: 'down',
      changeText: 'Decreased from 45 mm to 15 mm',
      description: 'Erythrocyte Sedimentation Rate has fallen back to baseline normal physiological levels following resolution of the acute inflammatory phase.',
      latestValue: '15 mm',
      referenceRange: '0-15 mm',
      category: 'Hematology',
    },
    {
      id: 'ins-4',
      title: 'Glycemic Control Stabilization',
      biomarker: 'Glucose',
      status: 'stable',
      trend: 'down',
      changeText: 'Fasting Glucose stabilized at 95 mg/dl',
      description: 'Fasting blood sugar levels have returned below the 100 mg/dl threshold following dietary adjustment, down from a peak of 118 mg/dl.',
      latestValue: '95 mg/dl',
      referenceRange: '70-99 mg/dl',
      category: 'Biochemistry',
    },
    {
      id: 'ins-5',
      title: 'Lipid Profile Monitoring',
      biomarker: 'Cholesterol',
      status: 'attention',
      trend: 'down',
      changeText: 'Total Cholesterol decreased from 235 to 190 mg/dl',
      description: 'Cholesterol levels have reduced back below 200 mg/dl, but ongoing dietary awareness is recommended to maintain healthy lipid balances.',
      latestValue: '190 mg/dl',
      referenceRange: '< 200 mg/dl',
      category: 'Biochemistry',
    },
  ];
}
