import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { mapReport } from '@/utils/map-report';
import { getLocalReports, saveLocalReport } from '@/lib/local-store';

/**
 * GET /api/reports?uuid=D198349
 * Fetch all reports for Patient UUID from Cloud Firestore via Firebase Admin SDK.
 * Fallbacks to server-side local storage if Cloud Firestore API is disabled on GCP.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get('uuid') || 'D198349';

  try {
    const snapshot = await adminDb.collection('users').doc(uuid).collection('reports').orderBy('date', 'desc').get();

    const reports = snapshot.docs.map((doc) => {
      const data = doc.data();
      const report = mapReport(data, doc.id);
      report.patientId = uuid;
      return report;
    });

    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    console.warn('Cloud Firestore API disabled/unavailable, using resilient server local store:', error?.message || error);
    const localReports = getLocalReports(uuid);
    return NextResponse.json({ success: true, reports: localReports });
  }
}

/**
 * POST /api/reports
 * Save new extracted / Gemini-parsed report into Cloud Firestore via Firebase Admin SDK.
 * Fallbacks to server-side local storage if Cloud Firestore API is disabled on GCP.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const uuid = body.patientUuid || body.patient_id || 'D198349';
    const rawInput = body.apiReport || body;

    const apiReport = ('data' in rawInput && rawInput.data) ? rawInput.data : rawInput;
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    apiReport.patient_id = uuid;

    try {
      await adminDb.collection('users').doc(uuid).collection('reports').doc(reportId).set({
        ...apiReport,
        createdAt: new Date(),
      });
    } catch (fsErr: any) {
      console.warn('Firestore write unavailable, saving to server local store:', fsErr?.message || fsErr);
    }

    // Always persist to local store as well for maximum reliability
    const mappedReport = saveLocalReport(apiReport, uuid, reportId);

    return NextResponse.json({ success: true, report: mappedReport });
  } catch (error: any) {
    console.error('Server API POST report error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to save report' }, { status: 500 });
  }
}
