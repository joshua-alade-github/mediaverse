import { supabase } from '@/lib/client/supabase';
import { UserPreferences } from './types';

export class PreferenceAnalyzer {
  private userId: string;
  private supabase = supabase;

  constructor(userId: string) {
    this.userId = userId;
  }

  async analyzePreferences(mediaType: string): Promise<UserPreferences> {
    // Get user's reviews and ratings
    const { data: reviews } = await this.supabase
      .from('reviews')
      .select(`
        rating,
        media!inner(
          id,
          genres(name),
          creators(name, role)
        )
      `)
      .eq('user_id', this.userId)
      .eq('media.media_type', mediaType);

    // Calculate genre weights based on ratings
    const genreWeights: Record<string, { total: number; count: number }> = {};
    const creatorWeights: Record<string, { total: number; count: number }> = {};

    reviews?.forEach((review) => {
      const weight = (review.rating - 5) / 5; // Normalize to -1 to 1 range

      // Process genres
      review.media.genres?.forEach((genre: { name: string }) => {
        if (!genreWeights[genre.name]) {
          genreWeights[genre.name] = { total: 0, count: 0 };
        }
        genreWeights[genre.name].total += weight;
        genreWeights[genre.name].count += 1;
      });

      // Process creators
      review.media.creators?.forEach((creator: { name: string }) => {
        if (!creatorWeights[creator.name]) {
          creatorWeights[creator.name] = { total: 0, count: 0 };
        }
        creatorWeights[creator.name].total += weight;
        creatorWeights[creator.name].count += 1;
      });
    });

    // Calculate final weights
    const finalGenreWeights = Object.fromEntries(
      Object.entries(genreWeights).map(([genre, { total, count }]) => [
        genre,
        total / count,
      ])
    );

    const finalCreatorWeights = Object.fromEntries(
      Object.entries(creatorWeights).map(([creator, { total, count }]) => [
        creator,
        total / count,
      ])
    );

    // Store updated preferences
    await this.supabase
      .from('user_preferences_data')
      .upsert({
        user_id: this.userId,
        media_type: mediaType,
        genre_weights: finalGenreWeights,
        creator_weights: finalCreatorWeights,
      });

    return {
      mediaType,
      genreWeights: finalGenreWeights,
      creatorWeights: finalCreatorWeights,
    };
  }
}