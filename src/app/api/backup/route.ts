import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createBackup } from '@/lib/backup';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const backup = await createBackup(session.user.id);

    // Create backup record
    const { data: backupRecord, error } = await supabase
      .from('backups')
      .insert({
        user_id: session.user.id,
        size: new Blob([backup]).size,
        status: 'completed',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(backupRecord);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}