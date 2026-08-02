import { Report, ApiReport } from '@/types';
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
    console.warn('Server API Route fetch warning:', error);
  }

  return [];
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

  return null;
}

/**
 * Add or update a parsed diagnostic report via Server API Route (/api/reports).
 */
export async function saveReportToFirestore(rawInput: ApiReport | any, patientUuid: string): Promise<Report> {
  const apiReport: ApiReport = ('data' in rawInput && rawInput.data) ? rawInput.data : rawInput;
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  apiReport.patient_id = patientUuid;

  // source_file rides on the extraction envelope, not the parsed payload — carry it
  // across the unwrap so the report keeps a pointer to its original document.
  if (rawInput?.source_file && !apiReport.source_file) {
    apiReport.source_file = rawInput.source_file;
  }

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
