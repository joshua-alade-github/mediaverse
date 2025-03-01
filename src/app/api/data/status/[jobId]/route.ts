import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check both import and export tables
  const [importJob, exportJob] = await Promise.all([
    supabase
      .from('data_imports')
      .select('*')
      .eq('id', params.jobId)
      .single(),
    supabase
      .from('data_exports')
      .select('*')
      .eq('id', params.jobId)
      .single(),
  ]);

  const job = importJob.data || exportJob.data;

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  // Verify ownership
  if (job.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(job);
}