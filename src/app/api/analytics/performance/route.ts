import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/server/supabase';

export async function POST(request: NextRequest) {
  try {
    const metrics = await request.json();
    const supabase = await createServiceClient();

    await supabase
      .from('performance_metrics')
      .insert({
        url: metrics.url,
        time_to_first_byte: metrics.timeToFirstByte,
        first_contentful_paint: metrics.firstContentfulPaint,
        dom_interactive: metrics.domInteractive,
        dom_complete: metrics.domComplete,
        load_event: metrics.loadEvent,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving performance metrics:', error);
    return NextResponse.json({ error: 'Failed to save metrics' }, { status: 500 });
  }
}