import fs from 'fs';
import path from 'path';

export async function POST(req) {
  const { filename } = await req.json();

  if (!filename) {
    return new Response(JSON.stringify({ error: 'Dosya adı eksik' }), { status: 400 });
  }

  const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    return new Response(JSON.stringify({ success: true }));
  } else {
    return new Response(JSON.stringify({ error: 'Dosya bulunamadı' }), { status: 404 });
  }
}
