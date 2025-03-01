import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { withActivity } from '@/middleware/withActivity';
import { NextRequest } from 'next/server';

async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { rating, content } = await request.json();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Create review
    const { data: review } = await supabase
      .from('reviews')
      .insert({
        user_id: session.user.id,
        media_id: params.id,
        rating,
        content,
      })
      .select('*, media(*), user:user_profiles(*)')
      .single();

    // Add activity event
    request.activityEvents = [{
      type: 'media_review',
      content: `reviewed ${review.media.title}`,
      metadata: {
        reviewId: review.id,
        mediaId: review.media_id,
        mediaTitle: review.media.title,
        rating,
        username: review.user.username,
      },
    }];

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export const POST = withActivity(handler);