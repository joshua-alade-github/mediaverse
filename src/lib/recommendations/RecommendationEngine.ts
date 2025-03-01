import { supabase } from '@/lib/client/supabase';
import { Recommendation } from './types';
import { PreferenceAnalyzer } from './PreferenceAnalyzer';

export class RecommendationEngine {
  private userId: string;
  private supabase = supabase;

  constructor(userId: string) {
    this.userId = userId;
  }

  async generateRecommendations(mediaType: string): Promise<Recommendation[]> {
    // Get user preferences
    const { data: preferences } = await this.supabase
      .from('user_preferences_data')
      .select('*')
      .eq('user_id', this.userId)
      .eq('media_type', mediaType)
      .single();

    if (!preferences) {
      const analyzer = new PreferenceAnalyzer(this.userId);
      await analyzer.analyzePreferences(mediaType);
    }

    // Get media not yet rated or in user's lists
    const { data: media } = await this.supabase
      .from('media')
      .select(`
        *,
        genres(name),
        creators(name, role)
      `)
      .eq('media_type', mediaType)
      .not('id', 'in', `(
        select media_id
        from reviews
        where user_id = '${this.userId}'
      )`);

    // Calculate scores for each media item
    const recommendations = media?.map((item) => {
      let score = 0;
      let reasons: string[] = [];

      // Genre matching
      item.genres?.forEach((genre: { name: string }) => {
        const weight = preferences.genre_weights[genre.name] || 0;
        score += weight;
        if (weight > 0.5) {
          reasons.push(`Based on your interest in ${genre.name}`);
        }
      });

      // Creator matching
      item.creators?.forEach((creator: { name: string }) => {
        const weight = preferences.creator_weights[creator.name] || 0;
        score += weight;
        if (weight > 0.5) {
          reasons.push(`Because you liked works by ${creator.name}`);
        }
      });

      return {
        mediaId: item.id,
        score,
        reason: reasons[0] || 'Based on your preferences',
        media: item,
      };
    });

    // Sort by score and take top recommendations
    const topRecommendations = recommendations
      ?.sort((a, b) => b.score - a.score)
      .slice(0, 20);

    // Store recommendations
    await this.supabase
      .from('recommendations')
      .upsert(
        topRecommendations.map((rec) => ({
          user_id: this.userId,
          media_id: rec.mediaId,
          score: rec.score,
          reason: rec.reason,
        }))
      );

    return topRecommendations;
  }

  async getRecommendations(mediaType: string): Promise<Recommendation[]> {
    // Get stored recommendations
    const { data: recommendations } = await this.supabase
      .from('recommendations')
      .select(`
        *,
        media(*)
      `)
      .eq('user_id', this.userId)
      .order('score', { ascending: false })
      .limit(20);

    // If no recommendations or old ones, generate new ones
    if (!recommendations?.length) {
      return this.generateRecommendations(mediaType);
    }

    return recommendations;
  }
}