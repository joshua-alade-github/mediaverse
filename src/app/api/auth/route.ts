import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { action, ...data } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  switch (action) {
    case 'signUp': {
      const { email, password, username } = data;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user?.id,
          username,
          email,
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 400 });
      }

      // Create default lists
      const defaultLists = [
        { title: 'Watchlist', description: 'Media I want to watch', is_default: true },
        { title: 'Favorites', description: 'My favorite media', is_default: true },
        { title: 'Currently Watching', description: 'Media I am currently watching', is_default: true },
        { title: 'Completed', description: 'Media I have completed', is_default: true },
      ];

      const { error: listsError } = await supabase
        .from('lists')
        .insert(
          defaultLists.map(list => ({
            ...list,
            user_id: authData.user?.id,
            created_at: new Date().toISOString(),
          }))
        );

      if (listsError) {
        console.error('Error creating default lists:', listsError);
        // Continue anyway, as this is not critical
      }

      return NextResponse.json({ success: true });
    }

    case 'signIn': {
      const { email, password } = data;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    case 'resetPassword': {
      const { email } = data;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/update-password`,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    case 'updateUser': {
      const { userData } = data;
      const { error } = await supabase.auth.updateUser(userData);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    case 'signOut': {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}