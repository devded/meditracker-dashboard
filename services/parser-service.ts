/**
 * Service utility to interact with the Next.js Server API Route (/api/extract),
 * which archives the original document to Firebase Storage and proxies 3rd-party
 * medical report extraction to https://medparser.vercel.app/extract server-to-server.
 */

import { ParsedApiResponse, SourceFile } from '@/types';

export type ExtractionResult = ParsedApiResponse & { source_file?: SourceFile | null };

export async function extractReportFromFile(file: File, patientUuid: string): Promise<ExtractionResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('patientUuid', patientUuid);

  const response = await fetch('/api/extract', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    throw new Error(errorJson?.error || `MedParser API extraction failed (${response.status})`);
  }

  const jsonResult = await response.json();
  return jsonResult;
}
