import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type');
  const genre = searchParams.get('genre');
  
  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });
  let queryBuilder = supabase
    .from('media')
    .select(`
      *,
      genres!inner (name)
    `)
    .textSearch('title', query);

  if (type) {
    queryBuilder = queryBuilder.eq('media_type', type);
  }

  if (genre) {
    queryBuilder = queryBuilder.eq('genres.name', genre);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}