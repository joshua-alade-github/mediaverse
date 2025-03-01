import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mediaType = searchParams.get('type');
  const period = searchParams.get('period') || '7days';

  const supabase = createRouteHandlerClient({ cookies });

  // Calculate trending based on recent activity
  const periodDate = new Date();
  periodDate.setDate(periodDate.getDate() - (period === '30days' ? 30 : 7));

  let query = supabase
    .from('media')
    .select(`
      *,
      reviews (count),
      posts (count)
    `);

  if (mediaType) {
    query = query.eq('media_type', mediaType);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Calculate trending score based on review and post counts
  const trending = data
    .map((item) => ({
      ...item,
      trendingScore:
        (item.reviews?.[0]?.count || 0) * 2 + // Weight reviews more heavily
        (item.posts?.[0]?.count || 0),
    }))
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, 10);

  return NextResponse.json(trending);
}