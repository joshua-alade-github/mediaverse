import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { exportUserData } from '@/lib/export';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { exportTypes } = await request.json();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Create export job
    const { data: exportJob, error: createError } = await supabase
      .from('data_exports')
      .insert({
        user_id: session.user.id,
        export_type: exportTypes,
        status: 'pending',
      })
      .select()
      .single();

    if (createError) throw createError;

    // Start export process
    exportUserData(exportJob.id, session.user.id, exportTypes);

    return NextResponse.json(exportJob);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}