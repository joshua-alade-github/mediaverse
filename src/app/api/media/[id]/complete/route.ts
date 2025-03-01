import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { withStatistics } from '@/middleware/withStatistics';
import { NextRequest } from 'next/server';

async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Mark media as complete
    await supabase
      .from('list_items')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('media_id', params.id)
      .eq('user_id', session.user.id);

    // Add statistics event
    request.statisticsEvents = [{
      type: 'media_complete',
      metadata: {
        mediaId: params.id,
      },
    }];

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to mark as complete' },
      { status: 500 }
    );
  }
}

export const POST = withStatistics(handler);