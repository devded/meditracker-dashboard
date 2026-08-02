import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { mapReport } from '@/utils/map-report';
import { getLocalReportById, deleteLocalReport } from '@/lib/local-store';

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
    console.warn('API Route getDoc error, checking local store:', error);
  }

  const localReport = getLocalReportById(id, uuid);
  if (localReport) {
    return NextResponse.json({ success: true, report: localReport });
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
  } catch (error: any) {
    console.warn('Firestore delete unavailable, deleting from local store:', error?.message);
  }

  deleteLocalReport(id, uuid);
  return NextResponse.json({ success: true });
}
