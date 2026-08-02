import { getReportsFromFirestore, getReportFromFirestoreById, saveReportToFirestore, deleteReportFromFirestore } from './firebase-service';
import { getPatientUuid } from '@/lib/patient-uuid';
import { Report, BiomarkerTrendPoint, DashboardStats, InsightCardData, ApiReport } from '@/types';

/**
 * Fetch all medical reports for the specified (or active) Patient UUID from Cloud Firestore.
 */
export async function getReports(patientUuid?: string): Promise<Report[]> {
  const uuid = patientUuid || getPatientUuid();
  return await getReportsFromFirestore(uuid);
}

/**
 * Fetch a single report by ID for the specified (or active) Patient UUID.
 */
export async function getReportById(id: string, patientUuid?: string): Promise<Report | null> {
  const uuid = patientUuid || getPatientUuid();
  return await getReportFromFirestoreById(id, uuid);
}

/**
 * Save a newly uploaded / Gemini-parsed report to Cloud Firestore under Patient UUID.
 */
export async function createReport(apiReport: ApiReport | any, patientUuid?: string): Promise<Report> {
  const uuid = patientUuid || getPatientUuid();
  return await saveReportToFirestore(apiReport, uuid);
}

/**
 * Delete a report from Cloud Firestore.
 */
export async function removeReport(id: string, patientUuid?: string): Promise<boolean> {
  const uuid = patientUuid || getPatientUuid();
  return await deleteReportFromFirestore(id, uuid);
}

/**
 * Get overall dashboard overview stats.
 */
export async function getDashboardStats(patientUuid?: string): Promise<DashboardStats> {
  const reports = await getReports(patientUuid);
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
export async function getBiomarkerHistory(testName: string, patientUuid?: string): Promise<BiomarkerTrendPoint[]> {
  const reports = await getReports(patientUuid);
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
export async function getAvailableBiomarkers(patientUuid?: string): Promise<string[]> {
  const reports = await getReports(patientUuid);
  const testCounts: Record<string, number> = {};

  reports.forEach((r) => {
    r.tests.forEach((t) => {
      testCounts[t.name] = (testCounts[t.name] || 0) + 1;
    });
  });

  return Object.keys(testCounts)
    .filter((name) => testCounts[name] >= 1 && name.toLowerCase() !== 'others')
    .sort();
}

/**
 * Category counts across all reports for pie chart distribution.
 */
export async function getCategoryDistribution(patientUuid?: string): Promise<{ category: string; count: number; fill: string }[]> {
  const reports = await getReports(patientUuid);
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
export async function getAbnormalTrendByReport(patientUuid?: string): Promise<{ date: string; lab: string; total: number; abnormal: number; normal: number }[]> {
  const reports = await getReports(patientUuid);
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
 * Dynamically generate plain-language descriptive insights derived from the patient's actual Firestore reports.
 */
export async function getInsights(patientUuid?: string): Promise<InsightCardData[]> {
  const reports = await getReports(patientUuid);
  if (reports.length === 0) return [];

  const insights: InsightCardData[] = [];
  const testMap: Record<string, { latest: any; previous: any | null }> = {};

  // Sort reports newest first
  const sorted = [...reports].sort(
    (a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
  );

  sorted.forEach((report) => {
    report.tests.forEach((test) => {
      if (!testMap[test.name]) {
        testMap[test.name] = { latest: test, previous: null };
      } else if (!testMap[test.name].previous) {
        testMap[test.name].previous = test;
      }
    });
  });

  Object.entries(testMap).forEach(([testName, { latest, previous }], idx) => {
    if (latest.isAbnormal) {
      insights.push({
        id: `ins-${idx}`,
        title: `Out-of-Range Observation: ${testName}`,
        biomarker: testName,
        status: 'attention',
        trend: previous && previous.value < latest.value ? 'up' : 'down',
        changeText: `Observed value: ${latest.rawValue} ${latest.unit}`,
        description: `${testName} is currently outside the standard reference range (${latest.referenceRange || 'Standard'}). Clinical follow-up recommended.`,
        latestValue: `${latest.rawValue} ${latest.unit}`,
        referenceRange: latest.referenceRange,
        category: latest.category,
      });
    } else if (previous && previous.isAbnormal && !latest.isAbnormal) {
      insights.push({
        id: `ins-${idx}`,
        title: `Recovery Trend: ${testName}`,
        biomarker: testName,
        status: 'improving',
        trend: 'up',
        changeText: `Normalized from ${previous.rawValue} to ${latest.rawValue} ${latest.unit}`,
        description: `${testName} has successfully returned to standard reference bounds (${latest.referenceRange || 'Optimal'}).`,
        latestValue: `${latest.rawValue} ${latest.unit}`,
        referenceRange: latest.referenceRange,
        category: latest.category,
      });
    } else if (!latest.isAbnormal && insights.length < 5) {
      insights.push({
        id: `ins-${idx}`,
        title: `Optimal Level: ${testName}`,
        biomarker: testName,
        status: 'stable',
        trend: 'stable',
        changeText: `Maintained at ${latest.rawValue} ${latest.unit}`,
        description: `${testName} is within normal reference limits (${latest.referenceRange || 'Optimal'}).`,
        latestValue: `${latest.rawValue} ${latest.unit}`,
        referenceRange: latest.referenceRange,
        category: latest.category,
      });
    }
  });

  return insights;
}
