import { NextRequest, NextResponse } from 'next/server';

const MEDPARSER_ENDPOINT = 'https://medparser.vercel.app/extract';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded in form data' }, { status: 400 });
    }

    const forwardFormData = new FormData();
    forwardFormData.append('file', file);

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    const model = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-3.6-flash';

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
      return NextResponse.json({ success: false, error: `MedParser API failed (${response.status}): ${errorText}` }, { status: response.status });
    }

    const jsonResult = await response.json();
    return NextResponse.json(jsonResult);
  } catch (error: any) {
    console.error('Server API extract proxy error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Extraction server proxy error' }, { status: 500 });
  }
}
