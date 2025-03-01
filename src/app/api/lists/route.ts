import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { title, description, isPrivate, items } = await request.json();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: list, error: listError } = await supabase
    .from('lists')
    .insert({
      title,
      description,
      is_private: isPrivate,
      user_id: session.user.id,
    })
    .select()
    .single();

  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 400 });
  }

  if (items?.length) {
    const listItems = items.map((mediaId: string) => ({
      list_id: list.id,
      media_id: mediaId,
    }));

    const { error: itemsError } = await supabase
      .from('list_items')
      .insert(listItems);

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ data: list });
}