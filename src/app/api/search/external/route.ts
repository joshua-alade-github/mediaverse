import { NextResponse } from 'next/server';
import { searchAllServices, getServiceForType } from '@/lib/services/media';
import type { MediaType } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type') as MediaType | undefined;

  if (!query) {
    return NextResponse.json(
      { error: 'Query is required' }, 
      { status: 400 }
    );
  }

  try {
    let results;

    if (type) {
      // Search specific media type
      const service = getServiceForType(type);
      results = await service.searchMedia(query);
    } else {
      // Search all services
      results = await searchAllServices(query);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('External search error:', error);
    return NextResponse.json(
      { error: 'External search failed' },
      { status: 500 }
    );
  }
}