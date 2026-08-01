import { ApiReport } from '@/types';

export const RAW_MOCK_REPORTS: (ApiReport & { id: string })[] = [
  // 18/07/2024 - Report 1 (IBN SINA)
  {
    id: 'rep-006',
    patient_name: 'NOMAN',
    patient_id: 'D198349',
    date: '18/07/2024',
    lab_name: 'IBN SINA DIAGNOSTIC & IMAGING CENTER',
    doctor_name: 'Prof. Dr. Shohael Mahmud Arafat',
    clinical_summary: 'Comprehensive annual review. All biomarkers in target physiological ranges. Platelets 220k, ESR 15mm, Vitamin D 45 ng/ml.',
    tests: [
      { name: 'Haemoglobin', value: '14.2', unit: 'g/dl', reference_range: '13.5-17.5', is_abnormal: false, category: 'Hematology' },
      { name: 'Total RBC', value: '4.75', unit: 'mil/Cmm', reference_range: '4.5-5.5', is_abnormal: false, category: 'Hematology' },
      { name: 'ESR', value: '15', unit: 'mm', reference_range: '0-15', is_abnormal: false, category: 'Hematology' },
      { name: 'PCV/HCT', value: '44', unit: '%', reference_range: '40-50%', is_abnormal: false, category: 'Hematology' },
      { name: 'Total WBC', value: '6,800', unit: '/Cmm', reference_range: '4,000-11,000', is_abnormal: false, category: 'Hematology' },
      { name: 'Total Platelet Count', value: '220,000', unit: '/Cmm', reference_range: '1,50,000-4,50,000', is_abnormal: false, category: 'Hematology' },
      { name: 'Sodium', value: '140', unit: 'mmol/L', reference_range: '135-145', is_abnormal: false, category: 'Electrolytes' },
      { name: 'Potassium', value: '4.2', unit: 'mmol/L', reference_range: '3.5-5.1', is_abnormal: false, category: 'Electrolytes' },
    ],
  },
  // 18/07/2024 - Report 2 (Popular Diagnostic - Same Date!)
  {
    id: 'rep-007',
    patient_name: 'NOMAN',
    patient_id: 'D198349',
    date: '18/07/2024',
    lab_name: 'Popular Diagnostic Centre',
    doctor_name: 'Dr. Nusrat Jahan',
    clinical_summary: 'Endocrine & Lipid Profile follow-up on same visit date. TSH and Cholesterol in optimal target range.',
    tests: [
      { name: 'Glucose', value: '95', unit: 'mg/dl', reference_range: '70-99', is_abnormal: false, category: 'Biochemistry' },
      { name: 'HbA1c', value: '5.4', unit: '%', reference_range: '4.0-5.6', is_abnormal: false, category: 'Biochemistry' },
      { name: 'TSH', value: '2.0', unit: 'uIU/ml', reference_range: '0.4-4.2', is_abnormal: false, category: 'Hormone' },
      { name: 'Cholesterol', value: '190', unit: 'mg/dl', reference_range: '< 200', is_abnormal: false, category: 'Biochemistry' },
      { name: 'Triglycerides', value: '130', unit: 'mg/dl', reference_range: '< 150', is_abnormal: false, category: 'Biochemistry' },
      { name: 'Vitamin D', value: '45', unit: 'ng/ml', reference_range: '30-100', is_abnormal: false, category: 'Hormone' },
    ],
  },

  // 28/05/2024
  {
    id: 'rep-005',
    patient_name: 'NOMAN',
    patient_id: 'D198349',
    date: '28/05/2024',
    lab_name: 'Popular Diagnostic Centre',
    doctor_name: 'Dr. Nusrat Jahan',
    clinical_summary: 'Significant metabolic improvement. Fasting Glucose normalized (98 mg/dl). Vitamin D now optimal (42 ng/ml).',
    tests: [
      { name: 'Haemoglobin', value: '15.0', unit: 'g/dl', reference_range: '13.5-17.5', is_abnormal: false, category: 'Hematology' },
      { name: 'ESR', value: '18', unit: 'mm', reference_range: '0-15', is_abnormal: true, category: 'Hematology' },
      { name: 'Total Platelet Count', value: '190,000', unit: '/Cmm', reference_range: '1,50,000-4,50,000', is_abnormal: false, category: 'Hematology' },
      { name: 'Glucose', value: '98', unit: 'mg/dl', reference_range: '70-99', is_abnormal: false, category: 'Biochemistry' },
      { name: 'HbA1c', value: '5.6', unit: '%', reference_range: '4.0-5.6', is_abnormal: false, category: 'Biochemistry' },
      { name: 'Vitamin D', value: '42', unit: 'ng/ml', reference_range: '30-100', is_abnormal: false, category: 'Hormone' },
    ],
  },

  // 12/03/2024
  {
    id: 'rep-004',
    patient_name: 'NOMAN',
    patient_id: 'D198349',
    date: '12/03/2024',
    lab_name: 'Square Hospital Ltd.',
    doctor_name: 'Prof. Dr. A. K. M. Shamsul Alam',
    clinical_summary: 'Post-viral recovery follow-up. Platelets rebounding from 70k to 120k. ESR resolving.',
    tests: [
      { name: 'Haemoglobin', value: '14.8', unit: 'g/dl', reference_range: '13.5-17.5', is_abnormal: false, category: 'Hematology' },
      { name: 'ESR', value: '30', unit: 'mm', reference_range: '0-15', is_abnormal: true, category: 'Hematology' },
      { name: 'Total Platelet Count', value: '120,000', unit: '/Cmm', reference_range: '1,50,000-4,50,000', is_abnormal: true, category: 'Hematology' },
      { name: 'Glucose', value: '110', unit: 'mg/dl', reference_range: '70-99', is_abnormal: true, category: 'Biochemistry' },
      { name: 'Cholesterol', value: '220', unit: 'mg/dl', reference_range: '< 200', is_abnormal: true, category: 'Biochemistry' },
    ],
  },

  // 21/01/2024 - Report 1 (IBN SINA)
  {
    id: 'rep-001',
    patient_name: 'NOMAN',
    patient_id: 'D198349',
    date: '21/01/2024',
    lab_name: 'IBN SINA DIAGNOSTIC & IMAGING CENTER',
    doctor_name: 'Prof. Dr. Shohael Mahmud Arafat',
    clinical_summary: 'Neutrophil leucocytosis. Elevated ESR and decreased Total Platelet Count (thrombocytopenia). Recommend repeat CBC in 2 weeks.',
    tests: [
      { name: 'Haemoglobin', value: '15.3', unit: 'g/dl', reference_range: 'Adult: Men: 15.0±2.0, Women: 13.5±1.5', is_abnormal: false, category: 'Hematology' },
      { name: 'ESR', value: '45', unit: 'mm', reference_range: 'Men: 0-10, Women:0-20', is_abnormal: true, category: 'Hematology' },
      { name: 'Neutrophils', value: '78', unit: '%', reference_range: '40-70%', is_abnormal: true, category: 'Hematology' },
      { name: 'Lymphocytes', value: '18', unit: '%', reference_range: '20-45%', is_abnormal: true, category: 'Hematology' },
      { name: 'Total Platelet Count', value: '70,000', unit: '/Cmm', reference_range: '1,50,000-4,50,000', is_abnormal: true, category: 'Hematology' },
      { name: 'Potassium', value: '5.4', unit: 'mmol/L', reference_range: '3.5-5.1', is_abnormal: true, category: 'Electrolytes' },
    ],
  },
  // 21/01/2024 - Report 2 (Square Hospital - Same Date!)
  {
    id: 'rep-008',
    patient_name: 'NOMAN',
    patient_id: 'D198349',
    date: '21/01/2024',
    lab_name: 'Square Hospital Ltd.',
    doctor_name: 'Prof. Dr. A. K. M. Shamsul Alam',
    clinical_summary: 'Renal & Hepatic Panel requested alongside CBC. Creatinine slightly elevated at 1.4 mg/dL.',
    tests: [
      { name: 'Creatinine', value: '1.4', unit: 'mg/dl', reference_range: '0.6-1.2', is_abnormal: true, category: 'Kidney' },
      { name: 'Urea', value: '38', unit: 'mg/dl', reference_range: '15-45', is_abnormal: false, category: 'Kidney' },
      { name: 'ALT/SGPT', value: '38', unit: 'U/L', reference_range: '7-56', is_abnormal: false, category: 'Liver' },
      { name: 'AST/SGOT', value: '30', unit: 'U/L', reference_range: '10-40', is_abnormal: false, category: 'Liver' },
    ],
  },

  // 04/12/2023
  {
    id: 'rep-003',
    patient_name: 'NOMAN',
    patient_id: 'D198349',
    date: '04/12/2023',
    lab_name: 'Labaid Diagnostic & Consultation Center',
    doctor_name: 'Dr. Mahbubur Rahman',
    clinical_summary: 'Pre-diabetic glycemic range (Glucose 105 mg/dl, HbA1c 6.1%). Commenced lifestyle modifications.',
    tests: [
      { name: 'Glucose', value: '105', unit: 'mg/dl', reference_range: '70-99', is_abnormal: true, category: 'Biochemistry' },
      { name: 'HbA1c', value: '6.1', unit: '%', reference_range: '4.0-5.6', is_abnormal: true, category: 'Biochemistry' },
      { name: 'Cholesterol', value: '210', unit: 'mg/dl', reference_range: '< 200', is_abnormal: true, category: 'Biochemistry' },
      { name: 'Vitamin D', value: '22', unit: 'ng/ml', reference_range: '30-100', is_abnormal: true, category: 'Hormone' },
    ],
  },

  // 15/10/2023
  {
    id: 'rep-002',
    patient_name: 'NOMAN',
    patient_id: 'D198349',
    date: '15/10/2023',
    lab_name: 'Evercare Hospital Dhaka',
    doctor_name: 'Dr. Farhana Rahman',
    clinical_summary: 'Routine health screening. Mild Vitamin D insufficiency noted.',
    tests: [
      { name: 'Haemoglobin', value: '13.1', unit: 'g/dl', reference_range: '13.5-17.5', is_abnormal: true, category: 'Hematology' },
      { name: 'Total Platelet Count', value: '210,000', unit: '/Cmm', reference_range: '1,50,000-4,50,000', is_abnormal: false, category: 'Hematology' },
      { name: 'Creatinine', value: '0.9', unit: 'mg/dl', reference_range: '0.6-1.2', is_abnormal: false, category: 'Kidney' },
      { name: 'Vitamin D', value: '18', unit: 'ng/ml', reference_range: '30-100', is_abnormal: true, category: 'Hormone' },
    ],
  },
];
