import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const width = parseInt(searchParams.get('width') || '0');
    const height = parseInt(searchParams.get('height') || '0');
    const quality = parseInt(searchParams.get('quality') || '75');

    if (!imageUrl) {
      return new NextResponse('Missing image URL', { status: 400 });
    }

    // Fetch original image
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();

    // Process image with Sharp
    let imageProcess = sharp(buffer);

    // Resize if dimensions are provided
    if (width || height) {
      imageProcess = imageProcess.resize(width || null, height || null, {
        fit: 'cover',
        withoutEnlargement: true,
      });
    }

    // Convert to WebP format
    const optimizedImage = await imageProcess
      .webp({ quality })
      .toBuffer();

    // Return optimized image
    return new NextResponse(optimizedImage, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Image optimization error:', error);
    return new NextResponse('Image processing failed', { status: 500 });
  }
}