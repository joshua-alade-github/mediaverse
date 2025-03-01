import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { getTrendingAcrossServices, getPopularAcrossServices, getServiceForType } from '@/lib/services/media';
import { MediaType, NewsItem } from '@/types';

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

class APIClient {
 private supabase = createClient(
   process.env.NEXT_PUBLIC_SUPABASE_URL!,
   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
   {
     auth: {
       persistSession: true,
       autoRefreshToken: true,
     },
   }
 );

 get supabaseClient() {
   return this.supabase;
 }

 // External Media Methods
 async getMediaDetails(mediaType: MediaType, id: string) {
   const service = getServiceForType(mediaType);
   const details = await service.getMediaDetails(id);

   const { data: reviews } = await this.supabase
     .from('reviews')
     .select(`
       rating,
       user:user_profiles (
         username,
         avatar_url
       )
     `)
     .eq('media_external_id', id)
     .eq('media_type', mediaType);

   if (reviews?.length) {
     const ratings = reviews.map(r => r.rating);
     const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
     return {
       ...details,
       averageRating,
       totalReviews: reviews.length
     };
   }

   return details;
 }

 async searchMedia(params: {
   query?: string;
   mediaTypes?: MediaType[];
   genres?: string[];
   minRating?: number;
   maxRating?: number;
   releaseYearStart?: number;
   releaseYearEnd?: number;
   sortBy?: string;
   sortOrder?: string;
 }) {
   if (!params.mediaTypes?.length) return [];

   const results = await Promise.all(
     params.mediaTypes.map(async type => {
       const service = getServiceForType(type);
       
       const serviceOptions: any = {};
       switch(type) {
         case 'game':
           serviceOptions.genres = params.genres;
           serviceOptions.ordering = params.sortBy === 'rating' ? '-rating' : 
                                  params.sortBy === 'date' ? '-released' : 
                                  params.sortBy === 'title' ? 'name' : '-rating';
           break;
         case 'movie':
         case 'tv_show':
           serviceOptions.includeAdult = false;
           serviceOptions.year = params.releaseYearStart;
           break;
         case 'music':
           break;
       }

       return service.searchMedia(params.query || '', serviceOptions);
     })
   );

   let allResults = results.flat();

   if (params.minRating || params.maxRating) {
     allResults = allResults.filter(item => {
       if (params.minRating && (!item.averageRating || item.averageRating < params.minRating)) return false;
       if (params.maxRating && (!item.averageRating || item.averageRating > params.maxRating)) return false;
       return true;
     });
   }

   if (params.releaseYearStart || params.releaseYearEnd) {
     allResults = allResults.filter(item => {
       if (!item.releaseDate) return false;
       const year = new Date(item.releaseDate).getFullYear();
       if (params.releaseYearStart && year < params.releaseYearStart) return false;
       if (params.releaseYearEnd && year > params.releaseYearEnd) return false;
       return true;
     });
   }

   if (params.sortBy) {
     allResults.sort((a, b) => {
       const order = params.sortOrder === 'asc' ? 1 : -1;
       switch (params.sortBy) {
         case 'rating':
           return ((a.averageRating || 0) - (b.averageRating || 0)) * order;
         case 'date':
           return ((a.releaseDate?.getTime() || 0) - (b.releaseDate?.getTime() || 0)) * order;
         case 'title':
           return a.title.localeCompare(b.title) * order;
         default:
           return 0;
       }
     });
   }

   return allResults;
 }

 // Lists
 async getUserLists(userId: string) {
   const { data, error } = await this.supabase
     .from('lists')
     .select(`
       *,
       list_items (
         media_external_id,
         media_type
       ),
       list_collaborators (
         user:user_profiles (
           username,
           avatar_url
         )
       )
     `)
     .eq('user_id', userId);

   if (error) throw error;
   return data;
 }

 async createList(list: Tables['lists']['Insert']) {
   const { data, error } = await this.supabase
     .from('lists')
     .insert(list)
     .select()
     .single();

   if (error) throw error;
   return data;
 }

 async addToList(listId: string, mediaType: MediaType, mediaExternalId: string) {
   const { error } = await this.supabase
     .from('list_items')
     .insert({
       list_id: listId,
       media_type: mediaType,
       media_external_id: mediaExternalId,
       added_at: new Date().toISOString()
     });

   if (error) throw error;
 }

 // Reviews
 async getMediaReviews(mediaType: MediaType, mediaExternalId: string) {
   const { data, error } = await this.supabase
     .from('reviews')
     .select(`
       *,
       user:user_profiles (
         username,
         avatar_url
       )
     `)
     .eq('media_type', mediaType)
     .eq('media_external_id', mediaExternalId)
     .order('created_at', { ascending: false });

   if (error) throw error;
   return data;
 }

 async submitReview(review: {
   mediaType: MediaType;
   mediaExternalId: string;
   userId: string;
   rating: number;
   content?: string;
 }) {
   const { data, error } = await this.supabase
     .from('reviews')
     .upsert({
       media_type: review.mediaType,
       media_external_id: review.mediaExternalId,
       user_id: review.userId,
       rating: review.rating,
       content: review.content
     })
     .select()
     .single();

   if (error) throw error;
   return data;
 }

 // Recommendations
 async getRecommendations(userId: string, mediaType?: MediaType) {
   let query = this.supabase
     .from('recommendations')
     .select('*')
     .eq('user_id', userId);
 
   if (mediaType) {
     query = query.eq('media_type', mediaType);
   }
 
   const { data, error } = await query
     .order('score', { ascending: false })
     .limit(20);
 
   if (error) throw error;

   // Fetch media details for each recommendation
   const recommendationsWithMedia = await Promise.all(
     data.map(async (item) => {
       const mediaDetails = await this.getMediaDetails(item.media_type, item.media_external_id);
       return {
         ...item,
         media: mediaDetails
       };
     })
   );
 
   return recommendationsWithMedia;
 }

 // Trending & Popular
 async getTrendingMedia(mediaType?: MediaType) {
   const trending = await getTrendingAcrossServices(mediaType ? [mediaType] : undefined);
   if (mediaType) {
     return trending[mediaType] || [];
   }
   return Object.values(trending).flat();
 }

 async getPopularMedia(limit: number = 5) {
   const externalPopular = await getPopularAcrossServices();
   return Object.values(externalPopular).flat().slice(0, limit);
 }

 async getPopularReviews(mediaType: MediaType, { limit = 5 } = {}) {
   const { data, error } = await this.supabase
     .from('reviews')
     .select(`
       *,
       user:user_profiles (
         username,
         avatar_url
       )
     `)
     .eq('media_type', mediaType)
     .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
     .order('created_at', { ascending: false })
     .limit(limit);
 
   if (error) throw error;
   return data;
 }
 
 async getPopularLists(mediaType: MediaType, { limit = 3 } = {}) {
   const { data, error } = await this.supabase
     .from('lists')
     .select(`
       *,
       list_items (
         media_external_id,
         media_type
       ),
       user:user_profiles (
         username,
         avatar_url
       )
     `)
     .eq('list_items.media_type', mediaType)
     .eq('is_private', false)
     .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
     .order('created_at', { ascending: false })
     .limit(limit);
 
   if (error) throw error;

   // Fetch media details for items
   const listsWithMedia = await Promise.all(
     data.map(async list => ({
       ...list,
       items: await Promise.all(
         list.list_items.map(item => {
           const service = getServiceForType(item.media_type);
           return service.getMediaDetails(item.media_external_id);
         })
       )
     }))
   );
 
   return listsWithMedia;
 }
 
 async getTopReviewers(mediaType: MediaType, { limit = 5 } = {}) {
   const { data, error } = await this.supabase
     .from('reviews')
     .select(`
       user_id,
       user:user_profiles (
         username,
         avatar_url
       )
     `)
     .eq('media_type', mediaType)
     .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
 
   if (error) throw error;
 
   const reviewerStats = data.reduce((acc, review) => {
     if (!acc[review.user_id]) {
       acc[review.user_id] = {
         user: review.user,
         reviewCount: 0,
         totalRating: 0,
         averageRating: 0
       };
     }
     acc[review.user_id].reviewCount++;
     acc[review.user_id].totalRating += review.rating || 0;
     acc[review.user_id].averageRating = 
       acc[review.user_id].totalRating / acc[review.user_id].reviewCount;
     return acc;
   }, {});
 
   return Object.values(reviewerStats)
     .sort((a, b) => b.reviewCount - a.reviewCount || b.averageRating - a.averageRating)
     .slice(0, limit);
 }
 
 async getActiveCommunities(mediaType: MediaType, { limit = 6 } = {}) {
   const { data, error } = await this.supabase
     .from('communities')
     .select(`
       *,
       members:community_members (count)
     `)
     .eq('media_type', mediaType)
     .eq('is_private', false)
     .order('created_at', { ascending: false })
     .limit(limit);
 
   if (error) throw error;
   return data;
 }
 
 async getLatestNews(mediaType: MediaType, { limit = 6 } = {}): Promise<NewsItem[]> {
   const service = getServiceForType(mediaType);
   
   try {
     switch (mediaType) {
       case 'movie':
       case 'tv_show':
       case 'anime':
         return service.getUpcomingReleases(limit);
       case 'game':
       case 'comic':
       case 'manga':
         return service.getLatestNews(limit);
       case 'book':
       case 'music':
         return service.getNewReleases(limit);
       default:
         return [];
     }
   } catch (error) {
     console.error(`Error fetching news for ${mediaType}:`, error);
     return [];
   }
 }

 // Real-time subscriptions
 subscribeToUserEvents(userId: string, callback: (payload: any) => void) {
   return this.supabase
     .channel(`user-${userId}`)
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'activity_items',
       filter: `user_id=eq.${userId}`,
     }, callback)
     .subscribe();
 }

 subscribeToComments(mediaType: MediaType, mediaExternalId: string, callback: (payload: any) => void) {
   return this.supabase
     .channel(`comments-${mediaExternalId}`)
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'comments',
       filter: `media_external_id=eq.${mediaExternalId}`,
     }, callback)
     .subscribe();
 }
}

export const apiClient = new APIClient();