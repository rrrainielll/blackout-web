import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
  }

  const originalName = file.name || 'file';
  const ext = path.extname(originalName);
  const safeName = sanitizeFilename(path.basename(originalName, ext));
  const filename = `${Date.now()}-${randomUUID()}-${safeName}${ext}`;
  const filePath = path.join(uploadDir, filename);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);
  } catch (err) {
    console.error('Error saving uploaded file', err);
    return new Response(JSON.stringify({ error: 'Failed to save file' }), { status: 500 });
  }

  const fileUrl = `/uploads/${filename}`;
  return new Response(JSON.stringify({ url: fileUrl }), { status: 200 });
}
