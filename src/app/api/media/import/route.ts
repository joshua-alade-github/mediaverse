import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { ImportParams } from '@/types/api';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { mediaType, externalId, userId } = await request.json() as ImportParams;

    // Check authentication if userId is provided
    if (userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Check if already imported
    const { data: existing } = await supabase
      .from('media_external_references')
      .select('media_id')
      .eq('external_id', externalId)
      .maybeSingle();

    if (existing?.media_id) {
      // Return existing media
      const { data: media } = await supabase
        .from('media')
        .select('*')
        .eq('id', existing.media_id)
        .single();

      return NextResponse.json({ media });
    }

    // Create import job
    const { data: importJob } = await supabase
      .from('media_import_jobs')
      .insert({
        external_id: externalId,
        external_source: mediaType,
        user_id: userId,
        status: 'pending'
      })
      .select()
      .single();

    if (!importJob) {
      throw new Error('Failed to create import job');
    }

    // Queue the actual import process
    // This could trigger a background job, webhook, etc.
    // For now, we'll just return the job ID
    return NextResponse.json({
      jobId: importJob.id,
      status: 'pending'
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Import failed' },
      { status: 500 }
    );
  }
}