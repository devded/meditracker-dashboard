export interface ApiTest {
  name: string;
  value: string;
  unit: string;
  reference_range: string | null;
  is_abnormal: boolean;
  category: string;
}

/**
 * Provenance record for the original PDF/image a report was extracted from.
 * Firestore stays authoritative for the structured data; this points at the
 * immutable original that lets the extraction be verified or re-run.
 */
export interface SourceFile {
  /** Where the bytes live: Tigris object storage, or the server-local fallback. */
  backend: 's3' | 'local';
  /** Object key within the bucket, or path relative to the data dir. */
  path: string;
  /** Bucket the object key belongs to. */
  bucket?: string;
  /** Original filename as uploaded. */
  filename: string;
  contentType: string;
  size: number;
  /** Content hash — dedupe key and integrity check. */
  sha256: string;
  uploadedAt: string;
  /** Extractor that produced the structured data from this file. */
  extractorModel?: string;
}

export interface ApiReport {
  patient_name: string;
  patient_id: string;
  date: string;
  lab_name: string;
  doctor_name: string;
  clinical_summary: string;
  tests: ApiTest[];
  source_file?: SourceFile | null;
}

export interface ParsedApiResponse {
  success: boolean;
  model_used?: string;
  data: ApiReport;
}

export interface Test {
  id: string;
  name: string;
  value: number; // parsed from string, commas stripped
  rawValue: string; // original, for display
  unit: string;
  referenceRange: string | null;
  isAbnormal: boolean;
  category: string;
}

export interface Report {
  id: string;
  patientName: string;
  patientId: string;
  reportDate: string; // YYYY-MM-DD for sorting
  formattedDate: string; // e.g. "21 Jan 2024"
  labName: string;
  doctorName: string;
  clinicalSummary: string;
  /** Null for reports created by pasting JSON, which have no source document. */
  originalFile: SourceFile | null;
  tests: Test[];
}

export interface BiomarkerTrendPoint {
  date: string;
  formattedDate: string;
  labName: string;
  value: number;
  rawValue: string;
  unit: string;
  isAbnormal: boolean;
  referenceRange: string | null;
}

export interface DashboardStats {
  totalReports: number;
  totalTests: number;
  abnormalTests: number;
  categoriesCount: number;
  latestReport: Report | null;
}

export interface InsightCardData {
  id: string;
  title: string;
  biomarker: string;
  status: 'stable' | 'improving' | 'attention' | 'warning';
  trend: 'up' | 'down' | 'stable';
  changeText: string;
  description: string;
  latestValue: string;
  referenceRange: string | null;
  category: string;
}
