import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const supabase = createRouteHandlerClient({ cookies });
  let mediaQuery = supabase.from('media').select('*', { count: 'exact' });

  if (type) {
    mediaQuery = mediaQuery.eq('media_type', type);
  }

  if (query) {
    mediaQuery = mediaQuery.ilike('title', `%${query}%`);
  }

  const { data, count, error } = await mediaQuery
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    data,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}