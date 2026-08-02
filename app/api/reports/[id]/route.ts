import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
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
  } catch (error: any) {
    console.error('Failed to load report from Cloud Firestore:', error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Could not load report' },
      { status: 502 }
    );
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
    console.error('Failed to delete report from Cloud Firestore:', error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Could not delete report' },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
