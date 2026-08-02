import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { mapReport } from '@/utils/map-report';

/**
 * GET /api/reports?uuid=D198349
 * Fetch all reports for Patient UUID from Cloud Firestore via Firebase Admin SDK.
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
    console.error('Failed to load reports from Cloud Firestore:', error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Could not load reports' },
      { status: 502 }
    );
  }
}

/**
 * POST /api/reports
 * Save new extracted / Gemini-parsed report into Cloud Firestore via Firebase Admin SDK.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const uuid = body.patientUuid || body.patient_id || 'D198349';
    const rawInput = body.apiReport || body;

    const apiReport = ('data' in rawInput && rawInput.data) ? rawInput.data : rawInput;
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    apiReport.patient_id = uuid;

    // Preserve the provenance pointer written by /api/extract, whichever envelope it arrived in.
    const sourceFile = apiReport.source_file || rawInput?.source_file || body?.source_file || null;
    apiReport.source_file = sourceFile;

    await adminDb.collection('users').doc(uuid).collection('reports').doc(reportId).set({
      ...apiReport,
      createdAt: new Date(),
    });

    const mappedReport = mapReport(apiReport, reportId);
    mappedReport.patientId = uuid;

    return NextResponse.json({ success: true, report: mappedReport });
  } catch (error: any) {
    console.error('Server API POST report error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to save report' }, { status: 500 });
  }
}
