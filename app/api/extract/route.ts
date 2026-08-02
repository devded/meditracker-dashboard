import { NextRequest, NextResponse } from 'next/server';
import {
  saveOriginalFile,
  ALLOWED_ORIGINAL_TYPES,
  MAX_ORIGINAL_BYTES,
} from '@/lib/original-file-store';
import { SourceFile } from '@/types';

const MEDPARSER_ENDPOINT = 'https://medparser.vercel.app/extract';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'No file uploaded in form data' }, { status: 400 });
    }

    const patientUuid = (formData.get('patientUuid') as string) || 'D198349';
    const contentType = file.type || 'application/octet-stream';

    if (!ALLOWED_ORIGINAL_TYPES.includes(contentType.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${contentType}. Upload a PDF, JPG, or PNG.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_ORIGINAL_BYTES) {
      return NextResponse.json(
        { success: false, error: `File exceeds the ${MAX_ORIGINAL_BYTES / (1024 * 1024)} MB limit.` },
        { status: 413 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    const model = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-3.6-flash';

    // Read once, then reuse the bytes for both archival and extraction.
    const buffer = Buffer.from(await file.arrayBuffer());

    // Archive the original BEFORE extraction: if MedParser is down or misreads the
    // document, the source is still retained to retry or re-verify against.
    let sourceFile: SourceFile | null = null;
    try {
      sourceFile = await saveOriginalFile({
        buffer,
        contentType,
        filename: file.name || 'report',
        patientUuid,
        extractorModel: model,
      });
    } catch (storageError: unknown) {
      const message = storageError instanceof Error ? storageError.message : String(storageError);
      console.error('Failed to archive original report document:', message);
    }

    const forwardFormData = new FormData();
    forwardFormData.append('file', new Blob([new Uint8Array(buffer)], { type: contentType }), file.name || 'report');

    const response = await fetch(MEDPARSER_ENDPOINT, {
      method: 'POST',
      headers: {
        'X-Gemini-Api-Key': apiKey,
        'X-Gemini-Model': model,
      },
      body: forwardFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          success: false,
          error: `MedParser API failed (${response.status}): ${errorText}`,
          // Surfaced so a retry can reference the already-archived original.
          source_file: sourceFile,
        },
        { status: response.status }
      );
    }

    const jsonResult = await response.json();
    return NextResponse.json({ ...jsonResult, source_file: sourceFile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Extraction server proxy error';
    console.error('Server API extract proxy error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
