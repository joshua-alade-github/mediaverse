import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { mediaId, rating, content } = await request.json();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      media_id: mediaId,
      user_id: session.user.id,
      rating,
      content,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Create activity item
  await supabase.from('activity_items').insert({
    user_id: session.user.id,
    type: 'review',
    content: {
      reviewId: review.id,
      mediaId,
      rating,
    },
  });

  return NextResponse.json({ data: review });
}