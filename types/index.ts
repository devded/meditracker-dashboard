export interface ApiTest {
  name: string;
  value: string;
  unit: string;
  reference_range: string | null;
  is_abnormal: boolean;
  category: string;
}

export interface ApiReport {
  patient_name: string;
  patient_id: string;
  date: string;
  lab_name: string;
  doctor_name: string;
  clinical_summary: string;
  tests: ApiTest[];
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
  originalFileUrl: string;
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
