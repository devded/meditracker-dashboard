/**
 * Service utility to interact with the live 3rd-party medical report extraction API endpoint (https://medparser.vercel.app/extract).
 */

const MEDPARSER_ENDPOINT = 'https://medparser.vercel.app/extract';

export async function extractReportFromFile(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  const model = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-3.6-flash';

  const response = await fetch(MEDPARSER_ENDPOINT, {
    method: 'POST',
    headers: {
      'X-Gemini-Api-Key': apiKey,
      'X-Gemini-Model': model,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MedParser API extraction failed (${response.status}): ${errorText}`);
  }

  const jsonResult = await response.json();
  return jsonResult;
}
