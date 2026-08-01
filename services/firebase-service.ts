import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { RAW_MOCK_REPORTS } from '@/mock/reports';
import { mapReport } from '@/utils/map-report';
import { ApiReport, Report } from '@/types';

/**
 * Seed initial mock reports into Cloud Firestore under a specific Patient UUID if none exist.
 */
export async function seedMockReportsToFirestore(patientUuid: string): Promise<Report[]> {
  const seededReports: Report[] = [];

  for (const rawMock of RAW_MOCK_REPORTS) {
    const reportId = rawMock.id;
    const mapped = mapReport(rawMock, reportId);
    // Bind to the active patient UUID
    mapped.patientId = patientUuid;

    try {
      const docRef = doc(db, 'users', patientUuid, 'reports', reportId);
      await setDoc(docRef, {
        ...rawMock,
        patient_id: patientUuid,
        createdAt: serverTimestamp(),
      });
      seededReports.push(mapped);
    } catch (err) {
      console.warn('Firestore seeding fallback (offline mode):', err);
      seededReports.push(mapped);
    }
  }

  return seededReports.sort(
    (a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
  );
}

/**
 * Fetch all diagnostic reports for a given Patient UUID from Cloud Firestore.
 * Automatically seeds default reports if the Firestore collection is empty.
 */
export async function getReportsFromFirestore(patientUuid: string): Promise<Report[]> {
  try {
    const reportsRef = collection(db, 'users', patientUuid, 'reports');
    const q = query(reportsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Auto-seed mock reports for new Patient UUID
      return await seedMockReportsToFirestore(patientUuid);
    }

    const reports: Report[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as ApiReport;
      const report = mapReport(data, docSnap.id);
      report.patientId = patientUuid;
      reports.push(report);
    });

    return reports.sort(
      (a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
    );
  } catch (error) {
    console.warn('Firestore fetch error, falling back to local dataset:', error);
    // Fallback to local memory mock reports filtered by UUID
    return RAW_MOCK_REPORTS.map((raw) => {
      const r = mapReport(raw, raw.id);
      r.patientId = patientUuid;
      return r;
    }).sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
  }
}

/**
 * Fetch a single report by ID for a Patient UUID from Cloud Firestore.
 */
export async function getReportFromFirestoreById(reportId: string, patientUuid: string): Promise<Report | null> {
  try {
    const docRef = doc(db, 'users', patientUuid, 'reports', reportId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as ApiReport;
      const report = mapReport(data, docSnap.id);
      report.patientId = patientUuid;
      return report;
    }
  } catch (error) {
    console.warn('Firestore getDoc error:', error);
  }

  // Fallback check in mock reports
  const localMock = RAW_MOCK_REPORTS.find((r) => r.id === reportId);
  if (localMock) {
    const r = mapReport(localMock, localMock.id);
    r.patientId = patientUuid;
    return r;
  }

  return null;
}

/**
 * Add or update a parsed diagnostic report in Cloud Firestore for a Patient UUID.
 * Handles both direct ApiReport and Gemini parsed response wrappers ({ success: true, data: { ... } }).
 */
export async function saveReportToFirestore(rawInput: ApiReport | any, patientUuid: string): Promise<Report> {
  const apiReport: ApiReport = ('data' in rawInput && rawInput.data) ? rawInput.data : rawInput;
  const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  // Set patient ID
  apiReport.patient_id = patientUuid;

  const mappedReport = mapReport(apiReport, reportId);
  mappedReport.patientId = patientUuid;

  try {
    const docRef = doc(db, 'users', patientUuid, 'reports', reportId);
    await setDoc(docRef, {
      ...apiReport,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to save report to Firestore:', error);
  }

  return mappedReport;
}

/**
 * Delete a report from Cloud Firestore for a Patient UUID.
 */
export async function deleteReportFromFirestore(reportId: string, patientUuid: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', patientUuid, 'reports', reportId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Failed to delete report from Firestore:', error);
    return false;
  }
}
