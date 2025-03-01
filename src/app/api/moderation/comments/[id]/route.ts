import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { action, reason } = await request.json();

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

  switch (action) {
    case 'hide': {
      const { error } = await supabase
        .from('comments')
        .update({
          is_hidden: true,
          hidden_reason: reason,
          moderated_by: session.user.id,
          moderated_at: new Date().toISOString(),
        })
        .eq('id', params.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Update all related reports to resolved
      await supabase
        .from('comment_reports')
        .update({
          status: 'resolved',
          resolved_by: session.user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('comment_id', params.id);

      break;
    }
    case 'dismiss': {
      const { error } = await supabase
        .from('comment_reports')
        .update({
          status: 'dismissed',
          resolved_by: session.user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('comment_id', params.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      break;
    }
    default:
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
  }

  return NextResponse.json({ success: true });
}