import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify moderator status
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('is_moderator')
    .eq('id', session.user.id)
    .single();

  if (!userProfile?.is_moderator) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: reportedComments, error } = await supabase
    .from('comment_reports')
    .select(`
      *,
      comment:comments(
        *,
        user:user_profiles(*),
        reactions:comment_reactions(count)
      ),
      reporter:user_profiles(username)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(reportedComments);
}