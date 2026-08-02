import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { mapReport } from '@/utils/map-report';
import { BiomarkerTrendPoint } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testName = searchParams.get('testName') || 'Cholesterol';
  const uuid = searchParams.get('uuid') || 'D198349';

  let reports: any[] = [];

  try {
    const snapshot = await adminDb.collection('users').doc(uuid).collection('reports').get();
    reports = snapshot.docs.map((doc) => mapReport(doc.data(), doc.id));
  } catch (error: any) {
    console.error('Firestore history query failed:', error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Could not load biomarker history' },
      { status: 502 }
    );
  }

  const sortedReports = [...reports].sort(
    (a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime()
  );

  const history: BiomarkerTrendPoint[] = [];

  sortedReports.forEach((report) => {
    const matchingTest = report.tests.find(
      (t: any) => t.name.toLowerCase().trim() === testName.toLowerCase().trim()
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

  return NextResponse.json({ success: true, history });
}
