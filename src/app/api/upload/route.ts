import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

/**
 * Accepts a file upload via multipart/form-data, stores it in /tmp,
 * and returns a localhost URL that the Tabi API can fetch.
 *
 * For production, swap this with a cloud storage upload (S3, Cloudinary, etc.).
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const dir = join(process.cwd(), 'public', 'uploads');
    await mkdir(dir, { recursive: true });

    const ext = file.name.split('.').pop() || 'bin';
    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(dir, filename);
    await writeFile(filepath, buffer);

    const origin = req.nextUrl.origin;
    const url = `${origin}/uploads/${filename}`;

    return NextResponse.json({ ok: true, url, filename: file.name, size: buffer.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
