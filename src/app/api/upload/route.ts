import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      );
    }

    // Generar nombre único para la imagen
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear nombre único basado en timestamp
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `plan-${timestamp}.${extension}`;

    // Guardar en public/images
    const publicPath = join(process.cwd(), 'public', 'images', filename);
    await writeFile(publicPath, buffer);

    // Retornar URL pública
    const imageUrl = `/images/${filename}`;

    return NextResponse.json({ 
      success: true, 
      imageUrl 
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return NextResponse.json(
      { error: 'Error al subir la imagen' },
      { status: 500 }
    );
  }
}
