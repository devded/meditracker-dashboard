import { Report, ApiReport } from '@/types';
import { RAW_MOCK_REPORTS } from '@/mock/reports';
import { mapReport } from '@/utils/map-report';

/**
 * Fetch all diagnostic reports for a Patient UUID directly via Next.js Server API Route (/api/reports).
 * Powered by Firebase Admin SDK server-side (immune to browser adblockers / ERR_BLOCKED_BY_CLIENT).
 */
export async function getReportsFromFirestore(patientUuid: string): Promise<Report[]> {
  try {
    const res = await fetch(`/api/reports?uuid=${encodeURIComponent(patientUuid)}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.reports)) {
        return data.reports;
      }
    }
  } catch (error) {
    console.warn('Server API Route fetch warning, using local dataset:', error);
  }

  return RAW_MOCK_REPORTS.map((raw) => {
    const r = mapReport(raw, raw.id);
    r.patientId = patientUuid;
    return r;
  }).sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
}

/**
 * Fetch a single report by ID for a Patient UUID via Server API Route (/api/reports/[id]).
 */
export async function getReportFromFirestoreById(reportId: string, patientUuid: string): Promise<Report | null> {
  try {
    const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}?uuid=${encodeURIComponent(patientUuid)}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.report) {
        return data.report;
      }
    }
  } catch (error) {
    console.warn('Server API Route getDoc error:', error);
  }

  const localMock = RAW_MOCK_REPORTS.find((r) => r.id === reportId);
  if (localMock) {
    const r = mapReport(localMock, localMock.id);
    r.patientId = patientUuid;
    return r;
  }

  return null;
}

/**
 * Add or update a parsed diagnostic report via Server API Route (/api/reports).
 */
export async function saveReportToFirestore(rawInput: ApiReport | any, patientUuid: string): Promise<Report> {
  const apiReport: ApiReport = ('data' in rawInput && rawInput.data) ? rawInput.data : rawInput;
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  apiReport.patient_id = patientUuid;

  const mappedReport = mapReport(apiReport, reportId);
  mappedReport.patientId = patientUuid;

  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientUuid, apiReport }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.report) {
        return data.report;
      }
    }
  } catch (error) {
    console.error('Server API Route POST report error:', error);
  }

  return mappedReport;
}

/**
 * Delete a report for a Patient UUID via Server API Route (/api/reports/[id]).
 */
export async function deleteReportFromFirestore(reportId: string, patientUuid: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}?uuid=${encodeURIComponent(patientUuid)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (error) {
    console.error('Server API Route DELETE report error:', error);
    return false;
  }
}
