import { NextRequest, NextResponse } from 'next/server';

const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16 MB

/**
 * Accepts a file upload via multipart/form-data and returns a
 * base64 data-URL that the Tabi API can consume directly.
 *
 * Max file size: 16 MB (WhatsApp's own limit for most media).
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > MAX_FILE_SIZE) {
      const sizeMB = (bytes.byteLength / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `File too large (${sizeMB} MB). Maximum is 16 MB.` },
        { status: 413 },
      );
    }

    const base64 = Buffer.from(bytes).toString('base64');
    const mime = file.type || 'application/octet-stream';
    const dataUrl = `data:${mime};base64,${base64}`;

    return NextResponse.json({ ok: true, url: dataUrl, filename: file.name, size: bytes.byteLength });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
