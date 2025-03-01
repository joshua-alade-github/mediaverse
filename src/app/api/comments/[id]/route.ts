import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { content } = await request.json();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify comment ownership
  const { data: comment } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', params.id)
    .single();

  if (!comment || comment.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: updatedComment, error } = await supabase
    .from('comments')
    .update({
      content,
      is_edited: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(updatedComment);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify comment ownership or moderator status
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('is_moderator')
    .eq('id', session.user.id)
    .single();

  const { data: comment } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', params.id)
    .single();

  if (!comment || (comment.user_id !== session.user.id && !userProfile?.is_moderator)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}