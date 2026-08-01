import { ApiReport, Report, Test } from '@/types';
import { parseValue } from './parse-value';
import { parse, format, isValid } from 'date-fns';

/**
 * Adapter function that converts raw API (snake_case) report data into the UI (camelCase) model.
 */
export function mapReport(apiReport: ApiReport, idOverride?: string): Report {
  const id = idOverride || `rep_${Math.random().toString(36).substring(2, 9)}`;

  // Parse DD/MM/YYYY date
  let reportDate = '2024-01-01';
  let formattedDate = apiReport.date;
  
  if (apiReport.date) {
    const parsedDate = parse(apiReport.date, 'dd/MM/yyyy', new Date());
    if (isValid(parsedDate)) {
      reportDate = format(parsedDate, 'yyyy-MM-dd');
      formattedDate = format(parsedDate, 'dd MMM yyyy');
    }
  }

  const tests: Test[] = apiReport.tests.map((t, idx) => ({
    id: `test_${id}_${idx}`,
    name: t.name,
    value: parseValue(t.value),
    rawValue: t.value ?? '—',
    unit: t.unit ?? '',
    referenceRange: t.reference_range, // Can be null
    isAbnormal: Boolean(t.is_abnormal),
    category: t.category || 'General',
  }));

  return {
    id,
    patientName: apiReport.patient_name,
    patientId: apiReport.patient_id,
    reportDate,
    formattedDate,
    labName: apiReport.lab_name,
    doctorName: apiReport.doctor_name,
    clinicalSummary: apiReport.clinical_summary || 'No clinical remarks recorded.',
    originalFileUrl: `/mock/reports/${id}.pdf`,
    tests,
  };
}
