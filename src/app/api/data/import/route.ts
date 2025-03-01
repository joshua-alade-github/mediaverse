import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { handleFileUpload } from '@/lib/upload';
import { importUserData } from '@/lib/import';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const importSource = formData.get('source') as string;
  const importType = formData.get('type') as string;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Upload file
    const filePath = await handleFileUpload(file, session.user.id);

    // Create import job
    const { data: importJob, error: createError } = await supabase
      .from('data_imports')
      .insert({
        user_id: session.user.id,
        import_source: importSource,
        import_type: importType,
        file_path: filePath,
        status: 'pending',
      })
      .select()
      .single();

    if (createError) throw createError;

    // Start import process
    importUserData(importJob.id, filePath, importSource, importType);

    return NextResponse.json(importJob);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}