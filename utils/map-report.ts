import { ApiReport, Report, Test, ParsedApiResponse } from '@/types';
import { parseValue } from './parse-value';
import { parse, format, isValid } from 'date-fns';

/**
 * Ranked list of date formats MedParser has been observed to return.
 * `parse()` from date-fns is tried in order; the first valid result wins.
 * Keep more-specific patterns before less-specific ones (e.g. dd/MM/yyyy
 * before MM/dd/yyyy) so ambiguous dates resolve to the more common convention.
 */
const DATE_FORMATS = [
  'dd/MM/yyyy',     // 21/07/2026
  'dd-MM-yyyy',     // 21-07-2026
  'dd-MMM-yyyy',    // 22-May-2026
  'dd MMM yyyy',    // 22 May 2026
  'dd MMMM yyyy',   // 22 May 2026 (full month)
  'MM/dd/yyyy',     // 07/21/2026  (US-style)
  'yyyy-MM-dd',     // 2026-07-21  (ISO short)
  'yyyy/MM/dd',     // 2026/07/21
  'MMM dd, yyyy',   // May 22, 2026
  'MMMM dd, yyyy',  // May 22, 2026 (full month)
  'd/M/yyyy',       // 1/7/2026  (no zero-padding)
  'd-M-yyyy',       // 1-7-2026
];

/**
 * Normalise any date string MedParser might return into a valid Date object.
 * Tries the explicit format list first, then falls back to the native Date
 * constructor (which handles ISO-8601 and many locale strings).
 */
function normaliseDate(raw: string): Date | null {
  const trimmed = raw.trim();
  const ref = new Date();

  for (const fmt of DATE_FORMATS) {
    const d = parse(trimmed, fmt, ref);
    if (isValid(d)) return d;
  }

  // Last resort: native parser covers ISO-8601 full timestamps etc.
  const native = new Date(trimmed);
  return isValid(native) ? native : null;
}

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

  // Normalise whatever date string MedParser returned into yyyy-MM-dd + display form.
  let reportDate = '2024-01-01';
  let formattedDate = apiReport?.date || '01 Jan 2024';

  if (apiReport?.date) {
    const parsedDate = normaliseDate(apiReport.date);
    if (parsedDate) {
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
