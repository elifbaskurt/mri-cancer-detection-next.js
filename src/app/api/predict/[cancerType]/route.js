export async function POST(req, context) {
  const cancerType = context.params.cancerType;
  const lang = req.headers.get('accept-language')?.split(',')[0] || 'en';

  try {
    const form = await req.formData();
    const modelArch = form.get('model_arch');
    const image = form.get('image');

    if (!modelArch || !image) {
      return new Response(JSON.stringify({ error: 'Missing data' }), { status: 400 });
    }

    // Blob olarak gelen image'ı tekrar dosya haline getir
    const fixedImage = new File([await image.arrayBuffer()], image.name, {
      type: image.type || 'image/jpeg',
    });

    // Django için yeni FormData oluştur
    const djangoFormData = new FormData();
    djangoFormData.append('model_arch', modelArch);
    djangoFormData.append('image', fixedImage);

    // Django API'ye isteği gönder
    const djangoResponse = await fetch(`http://localhost:8000/predict/${cancerType}/`, {
      method: 'POST',
      headers: {
        'Accept-Language': lang,
        // ⚠️ Content-Type belirtme! FormData kendi ayarlıyor
      },
      body: djangoFormData,
    });

    const rawText = await djangoResponse.text(); // HTML mi JSON mu kontrol için
    console.log('📥 Django Response:', rawText);

    // Eğer yanıt JSON ise, dönüştür
    try {
      const parsed = JSON.parse(rawText);
      return new Response(JSON.stringify(parsed), { status: djangoResponse.status });
    } catch (e) {
      // HTML döndüyse olduğu gibi yolla
      return new Response(rawText, { status: djangoResponse.status });
    }
  } catch (err) {
    console.error('❌ Django API çağrısı başarısız:', err);
    return new Response(
      JSON.stringify({ error: 'Request to Django failed', message: err.message }),
      { status: 500 }
    );
  }
}
