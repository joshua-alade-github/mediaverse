import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { title, content, mediaId } = await request.json();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      title,
      content,
      media_id: mediaId,
      user_id: session.user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Create activity item
  await supabase.from('activity_items').insert({
    user_id: session.user.id,
    type: 'post',
    content: {
      postId: post.id,
      mediaId,
      title,
    },
  });

  return NextResponse.json({ data: post });
}