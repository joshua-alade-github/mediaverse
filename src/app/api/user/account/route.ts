import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // Delete all user-related data in this order (respect foreign key constraints)
    // Start with child tables
    await supabase.from('comment_reactions').delete().eq('user_id', userId);
    await supabase.from('review_reactions').delete().eq('user_id', userId);
    await supabase.from('post_reactions').delete().eq('user_id', userId);
    await supabase.from('comments').delete().eq('user_id', userId);
    await supabase.from('notifications').delete().eq('user_id', userId);
    await supabase.from('favorites').delete().eq('user_id', userId);
    await supabase.from('media_progress').delete().eq('user_id', userId);
    
    // List items first, then lists
    await supabase.from('list_items').delete().match({
      'list_id.user_id': userId
    });
    await supabase.from('lists').delete().eq('user_id', userId);
    
    // Reviews
    await supabase.from('reviews').delete().eq('user_id', userId);
    
    // User follows
    await supabase.from('user_follows').delete().eq('follower_id', userId);
    await supabase.from('user_follows').delete().eq('following_id', userId);
    
    // Activity and posts
    await supabase.from('activity').delete().eq('user_id', userId);
    await supabase.from('posts').delete().eq('user_id', userId);
    
    // Finally delete profile
    await supabase.from('user_profiles').delete().eq('id', userId);
    
    // Delete auth user last
    const { error: adminDeleteError } = await supabase.auth.admin.deleteUser(userId);
    if (adminDeleteError) throw adminDeleteError;
    
    // Sign out
    await supabase.auth.signOut();
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { username, bio } = await request.json();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        username: username || undefined,
        bio: bio || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}