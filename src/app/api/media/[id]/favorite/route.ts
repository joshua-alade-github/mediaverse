import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(
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

  // Check if already favorited
  const { data: existingFavorite } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .eq('media_id', mediaId)
    .maybeSingle();

  if (existingFavorite) {
    return NextResponse.json(
      { error: 'Media already in favorites' },
      { status: 400 }
    );
  }

  // Add to favorites
  const { error } = await supabase.from('favorites').insert({
    user_id: userId,
    media_id: mediaId,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Check if a "Favorites" list exists
  const { data: existingList } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', userId)
    .eq('title', 'Favorites')
    .maybeSingle();

  let listId = existingList?.id;

  // Create Favorites list if it doesn't exist
  if (!listId) {
    const { data: newList, error: createError } = await supabase
      .from('lists')
      .insert({
        user_id: userId,
        title: 'Favorites',
        description: 'My favorite media',
        is_default: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    listId = newList.id;
  }

  // Add media to favorites list
  const { error: itemError } = await supabase.from('list_items').insert({
    list_id: listId,
    media_id: mediaId,
    added_at: new Date().toISOString(),
  });

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, listId });
}

export async function DELETE(
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

  // Remove from favorites
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('media_id', mediaId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Find Favorites list
  const { data: favoritesList } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', userId)
    .eq('title', 'Favorites')
    .maybeSingle();

  if (favoritesList) {
    // Remove from favorites list
    await supabase
      .from('list_items')
      .delete()
      .eq('list_id', favoritesList.id)
      .eq('media_id', mediaId);
  }

  return NextResponse.json({ success: true });
}