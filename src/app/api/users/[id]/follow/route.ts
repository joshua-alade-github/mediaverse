import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const targetUserId = params.id;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const followerUserId = session.user.id;

  // Can't follow yourself
  if (followerUserId === targetUserId) {
    return NextResponse.json(
      { error: 'Cannot follow yourself' },
      { status: 400 }
    );
  }

  // Check if already following
  const { data: existingFollow } = await supabase
    .from('user_follows')
    .select('*')
    .eq('follower_id', followerUserId)
    .eq('following_id', targetUserId)
    .maybeSingle();

  if (existingFollow) {
    return NextResponse.json(
      { error: 'Already following this user' },
      { status: 400 }
    );
  }

  // Create the follow relationship
  const { error } = await supabase.from('user_follows').insert({
    follower_id: followerUserId,
    following_id: targetUserId,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create notification for the target user
  await supabase.from('notifications').insert({
    user_id: targetUserId,
    type: 'follow',
    content: `Someone started following you`,
    related_id: followerUserId,
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const targetUserId = params.id;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const followerUserId = session.user.id;

  // Delete the follow relationship
  const { error } = await supabase
    .from('user_follows')
    .delete()
    .eq('follower_id', followerUserId)
    .eq('following_id', targetUserId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}