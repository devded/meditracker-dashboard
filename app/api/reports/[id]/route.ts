import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { RAW_MOCK_REPORTS } from '@/mock/reports';
import { mapReport } from '@/utils/map-report';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get('uuid') || 'D198349';

  try {
    const docSnap = await adminDb.collection('users').doc(uuid).collection('reports').doc(id).get();
    if (docSnap.exists) {
      const data = docSnap.data();
      const report = mapReport(data, docSnap.id);
      report.patientId = uuid;
      return NextResponse.json({ success: true, report });
    }
  } catch (error) {
    console.warn('API Route getDoc error:', error);
  }

  const localMock = RAW_MOCK_REPORTS.find((r) => r.id === id);
  if (localMock) {
    const r = mapReport(localMock, localMock.id);
    r.patientId = uuid;
    return NextResponse.json({ success: true, report: r });
  }

  return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get('uuid') || 'D198349';

  try {
    await adminDb.collection('users').doc(uuid).collection('reports').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Delete failed' }, { status: 500 });
  }
}
