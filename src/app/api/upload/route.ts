import { NextRequest, NextResponse } from 'next/server';

/**
 * Accepts a file upload via multipart/form-data and returns a
 * base64 data-URL that the Tabi API can consume directly.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mime = file.type || 'application/octet-stream';
    const dataUrl = `data:${mime};base64,${base64}`;

    return NextResponse.json({ ok: true, url: dataUrl, filename: file.name, size: bytes.byteLength });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
