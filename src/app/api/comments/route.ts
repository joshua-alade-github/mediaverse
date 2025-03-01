import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mediaId = searchParams.get('mediaId');
  const parentId = searchParams.get('parentId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const sort = searchParams.get('sort') || 'recent';

  const supabase = createRouteHandlerClient({ cookies });

  let query = supabase
    .from('comments')
    .select(`
      *,
      user:user_profiles(*),
      reactions:comment_reactions(user_id, reaction_type),
      replies:comment_replies(*)
    `)
    .eq('media_id', mediaId)
    .eq('parent_id', parentId || null)
    .eq('is_hidden', false);

  if (sort === 'popular') {
    query = query.order('reaction_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: comments, error } = await query
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(comments);
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { content, mediaId, parentId } = await request.json();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      content,
      media_id: mediaId,
      parent_id: parentId,
      user_id: session.user.id,
    })
    .select(`
      *,
      user:user_profiles(*),
      reactions:comment_reactions(user_id, reaction_type)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(comment);
}
