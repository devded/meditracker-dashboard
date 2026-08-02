import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { adminDb } from '@/lib/firebase-admin';
import { mapReport } from '@/utils/map-report';
import { s3Client, isS3Configured } from '@/lib/s3-client';
import { Report } from '@/types';

/** Presigned URLs are short-lived so a leaked link stops working quickly. */
const SIGNED_URL_TTL_SECONDS = 300;

const ORIGINALS_DIR = path.join(process.cwd(), 'data', 'originals');

async function loadReport(id: string, uuid: string): Promise<Report | null> {
  try {
    const docSnap = await adminDb.collection('users').doc(uuid).collection('reports').doc(id).get();
    if (docSnap.exists) {
      const report = mapReport(docSnap.data(), docSnap.id);
      report.patientId = uuid;
      return report;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Firestore unavailable while loading report original:', message);
  }

  return null;
}

/**
 * GET /api/reports/:id/original?uuid=D198349
 *
 * Serves the source PDF/image a report was extracted from. Objects in Tigris are
 * private; this hands back a short-lived presigned URL rather than a permanent
 * public link. Locally-archived originals are streamed straight off disk.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get('uuid') || 'D198349';

  const report = await loadReport(id, uuid);
  if (!report) {
    return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
  }

  const source = report.originalFile;
  if (!source) {
    return NextResponse.json(
      { success: false, error: 'This report has no archived source document.' },
      { status: 404 }
    );
  }

  // The object key embeds the patient UUID it was archived under. Reject anything
  // that does not, so one patient's report id cannot surface another's document.
  if (!source.path.startsWith(`users/${uuid}/`)) {
    return NextResponse.json({ success: false, error: 'Source document access denied.' }, { status: 403 });
  }

  if (source.backend === 's3') {
    if (!isS3Configured) {
      return NextResponse.json(
        { success: false, error: 'Object storage is not configured on this server.' },
        { status: 503 }
      );
    }

    try {
      const signedUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: source.bucket,
          Key: source.path,
          ResponseContentType: source.contentType,
          ResponseContentDisposition: `inline; filename="${source.filename.replace(/"/g, '')}"`,
        }),
        { expiresIn: SIGNED_URL_TTL_SECONDS }
      );

      return NextResponse.redirect(signedUrl, 307);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Failed to presign original document URL:', message);
      return NextResponse.json(
        { success: false, error: 'Could not generate a link to the source document.' },
        { status: 502 }
      );
    }
  }

  // Local fallback archive — resolve inside the originals dir and refuse anything escaping it.
  const absolutePath = path.resolve(ORIGINALS_DIR, source.path);
  if (!absolutePath.startsWith(path.resolve(ORIGINALS_DIR) + path.sep) || !fs.existsSync(absolutePath)) {
    return NextResponse.json({ success: false, error: 'Archived source document is missing.' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(absolutePath);
  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      'Content-Type': source.contentType,
      'Content-Disposition': `inline; filename="${source.filename.replace(/"/g, '')}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
