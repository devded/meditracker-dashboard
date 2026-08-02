/**
 * Service utility to interact with the Next.js Server API Route (/api/extract),
 * which proxies 3rd-party medical report extraction to https://medparser.vercel.app/extract server-to-server.
 */

export async function extractReportFromFile(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

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
