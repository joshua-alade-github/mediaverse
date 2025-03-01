import { BaseImporter, ImportResult } from './base';
import { parseLetterboxdExport } from '../parsers/letterboxd';

export class LetterboxdImporter extends BaseImporter {
  async import(content: string): Promise<ImportResult> {
    const supabase = createClient();
    const result: ImportResult = {
      succeeded: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Create default lists if they don't exist
      await this.createDefaultLists();

      // Get watched list ID
      const { data: watchedList } = await supabase
        .from('lists')
        .select('id')
        .eq('user_id', this.userId)
        .eq('title', 'Watched')
        .single();

      const { valid, invalid } = parseLetterboxdExport(content);

      // Process each valid entry
      for (const item of valid) {
        try {
          // Check if media exists or create it
          let mediaId: string;
          const { data: existingMedia } = await supabase
            .from('media')
            .select('id')
            .eq('title', item.title)
            .eq('year', item.year)
            .single();

          if (existingMedia) {
            mediaId = existingMedia.id;
          } else {
            const { data: newMedia, error } = await supabase
              .from('media')
              .insert({
                title: item.title,
                year: item.year,
                media_type: 'movie',
              })
              .select('id')
              .single();

            if (error) throw error;
            mediaId = newMedia.id;
          }

          // Add review if exists
          if (item.user_rating || item.review) {
            await supabase.from('reviews').upsert({
              user_id: this.userId,
              media_id: mediaId,
              rating: item.user_rating,
              content: item.review,
              created_at: item.watched_at,
              imported_from: 'letterboxd',
            });
          }

          // Add to watched list
          if (watchedList) {
            await supabase.from('list_items').insert({
              list_id: watchedList.id,
              media_id: mediaId,
              added_at: item.watched_at,
            });
          }

          // Add tags
          if (item.tags.length > 0) {
            await supabase.from('media_tags').insert(
              item.tags.map((tag) => ({
                media_id: mediaId,
                user_id: this.userId,
                tag: tag.toLowerCase(),
              }))
            );
          }

          result.succeeded++;
        } catch (error) {
          result.failed++;
          result.errors.push(
            `Failed to import ${item.title}: ${error.message}`
          );
        }
      }

      // Add invalid entries to error count
      result.failed += invalid.length;
      invalid.forEach((item) => {
        result.errors.push(
          `Failed to parse: ${JSON.stringify(item.row)}`
        );
      });
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }

    return result;
  }
}