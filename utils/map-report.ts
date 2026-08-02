import { ApiReport, Report, Test, ParsedApiResponse } from '@/types';
import { parseValue } from './parse-value';
import { parse, format, isValid } from 'date-fns';

/**
 * Adapter function that converts raw API / AI Vision response (snake_case) report data into the UI (camelCase) model.
 * Seamlessly handles both direct ApiReport payloads and Gemini Vision wrapper responses:
 * { success: true, model_used: "gemini-3.6-flash", data: { ... } }
 */
export function mapReport(rawInput: ApiReport | ParsedApiResponse | any, idOverride?: string): Report {
  // Extract data payload if wrapped in Gemini / Vision AI response object ({ success: true, data: { ... } })
  const apiReport: ApiReport = (rawInput && typeof rawInput === 'object' && 'data' in rawInput && rawInput.data)
    ? rawInput.data
    : rawInput;

  const id = idOverride || `rep_${Math.random().toString(36).substring(2, 9)}`;

  // Parse DD/MM/YYYY date
  let reportDate = '2024-01-01';
  let formattedDate = apiReport?.date || '01 Jan 2024';
  
  if (apiReport?.date) {
    const parsedDate = parse(apiReport.date, 'dd/MM/yyyy', new Date());
    if (isValid(parsedDate)) {
      reportDate = format(parsedDate, 'yyyy-MM-dd');
      formattedDate = format(parsedDate, 'dd MMM yyyy');
    }
  }

  const rawTests = Array.isArray(apiReport?.tests) ? apiReport.tests : [];

  const tests: Test[] = rawTests.map((t, idx) => ({
    id: `test_${id}_${idx}`,
    name: t.name,
    value: parseValue(t.value),
    rawValue: t.value ?? '—',
    unit: t.unit ?? '',
    referenceRange: t.reference_range ?? null, // Can be null
    isAbnormal: Boolean(t.is_abnormal),
    category: t.category || 'General',
  }));

  return {
    id,
    patientName: apiReport?.patient_name || 'Patient',
    patientId: apiReport?.patient_id || 'ID-000',
    reportDate,
    formattedDate,
    labName: apiReport?.lab_name || 'Diagnostic Laboratory',
    doctorName: apiReport?.doctor_name || 'Attending Physician',
    clinicalSummary: apiReport?.clinical_summary || 'No clinical remarks recorded.',
    // Null for JSON-paste reports, which have no source document behind them.
    originalFile: apiReport?.source_file ?? null,
    tests,
  };
}
