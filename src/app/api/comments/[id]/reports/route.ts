import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { reason } = await request.json();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user has already reported this comment
  const { data: existingReport } = await supabase
    .from('comment_reports')
    .select('id')
    .eq('comment_id', params.id)
    .eq('reporter_id', session.user.id)
    .single();

  if (existingReport) {
    return NextResponse.json(
      { error: 'You have already reported this comment' },
      { status: 400 }
    );
  }

  const { data: report, error } = await supabase
    .from('comment_reports')
    .insert({
      comment_id: params.id,
      reporter_id: session.user.id,
      reason,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Check if comment has reached report threshold
  const { count } = await supabase
    .from('comment_reports')
    .select('id', { count: 'exact' })
    .eq('comment_id', params.id);

  if (count && count >= 5) {
    // Auto-hide comment if it reaches threshold
    await supabase
      .from('comments')
      .update({
        is_hidden: true,
        hidden_reason: 'Multiple user reports',
        moderated_at: new Date().toISOString(),
      })
      .eq('id', params.id);
  }

  return NextResponse.json(report);
}