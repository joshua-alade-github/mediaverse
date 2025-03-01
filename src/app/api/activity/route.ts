import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user's following list if no specific user is requested
  let followingIds = [session.user.id];
  if (!userId) {
    const { data: following } = await supabase
      .from('followers')
      .select('following_id')
      .eq('follower_id', session.user.id);

    if (following) {
      followingIds = [...followingIds, ...following.map((f) => f.following_id)];
    }
  }

  const query = supabase
    .from('activity_items')
    .select(`
      *,
      user_profiles (
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (userId) {
    query.eq('user_id', userId);
  } else {
    query.in('user_id', followingIds);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}