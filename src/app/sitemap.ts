import { supabase } from '@/lib/client/supabase';

export default async function sitemap() {
  // Fetch all media items
  const { data: media } = await supabase
    .from('media')
    .select('id, media_type, updated_at');

  // Fetch all users
  const { data: users } = await supabase
    .from('user_profiles')
    .select('username, updated_at');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mediaverse.app';

  // Static routes
  const routes = [
    '',
    '/movie',
    '/tv_show',
    '/game',
    '/book',
    '/music',
    '/comic',
    '/manga',
    '/anime',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
  }));

  // Media routes
  const mediaRoutes = (media || []).map((item) => ({
    url: `${baseUrl}/${item.media_type}/${item.id}`,
    lastModified: item.updated_at,
  }));

  // User profile routes
  const userRoutes = (users || []).map((user) => ({
    url: `${baseUrl}/profile/${user.username}`,
    lastModified: user.updated_at,
  }));

  return [...routes, ...mediaRoutes, ...userRoutes];
}