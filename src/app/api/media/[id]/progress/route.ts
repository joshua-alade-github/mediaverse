import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const mediaId = params.id;
  const { status } = await request.json();

  // Validate status
  if (!['not_started', 'in_progress', 'completed'].includes(status)) {
    return NextResponse.json(
      { error: 'Invalid status. Must be not_started, in_progress, or completed' },
      { status: 400 }
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Upsert media progress
  const { error } = await supabase
    .from('media_progress')
    .upsert({
      user_id: userId,
      media_id: mediaId,
      status,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If completed, create an activity entry
  if (status === 'completed') {
    // Get the media details first
    const { data: media } = await supabase
      .from('media')
      .select('title, media_type')
      .eq('id', mediaId)
      .single();

    if (media) {
      // Create activity entry
      await supabase.from('activity').insert({
        user_id: userId,
        type: 'media_complete',
        content: {
          media_id: mediaId,
          media_title: media.title,
          media_type: media.media_type,
        },
        created_at: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({ success: true });
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const mediaId = params.id;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Get current progress
  const { data, error } = await supabase
    .from('media_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('media_id', mediaId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    status: data?.status || 'not_started',
    updated_at: data?.updated_at,
  });
}