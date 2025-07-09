import fs from 'fs';
import path from 'path';

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file) {
    return new Response(JSON.stringify({ error: 'Dosya bulunamadı' }), { status: 400 });
  }

  const filename = file.name;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(uploadDir, filename), buffer);

  return new Response(JSON.stringify({ success: true, filename }));
}
