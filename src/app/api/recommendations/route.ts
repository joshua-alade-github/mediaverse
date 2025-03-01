import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const mediaId = searchParams.get('mediaId');
  const mediaType = searchParams.get('type');

  if (!mediaId || !mediaType) {
    return NextResponse.json(
      { error: 'Media ID and type are required' },
      { status: 400 }
    );
  }

  // Get genres of the current media
  const { data: currentMedia } = await supabase
    .from('media')
    .select('genres!inner (name)')
    .eq('id', mediaId)
    .single();

  if (!currentMedia?.genres) {
    return NextResponse.json([]);
  }

  const genres = currentMedia.genres.map((g: any) => g.name);

  // Find similar media based on genres
  const { data: recommendations } = await supabase
    .from('media')
    .select(`
      *,
      genres!inner (name)
    `)
    .eq('media_type', mediaType)
    .neq('id', mediaId)
    .in('genres.name', genres)
    .limit(6);

  return NextResponse.json(recommendations || []);
}