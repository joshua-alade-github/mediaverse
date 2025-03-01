import { supabase } from './supabase';

export const trackEvent = async (
  eventType: string,
  mediaId?: string,
  metadata?: any
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('analytics_events').insert({
      event_type: eventType,
      media_id: mediaId,
      user_id: user.id,
      metadata,
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};