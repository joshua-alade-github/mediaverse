import { BaseImporter, ImportResult } from './base';
import { parseImdbExport } from '../parsers/imdb';

export class ImdbImporter extends BaseImporter {
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
  
        // Get watchlist ID
        const { data: watchlist } = await supabase
          .from('lists')
          .select('id')
          .eq('user_id', this.userId)
          .eq('title', 'Watchlist')
          .single();
  
        const { valid, invalid } = parseImdbExport(content);
  
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
                  external_ratings: {
                    imdb: item.imdb_rating,
                  },
                })
                .select('id')
                .single();
  
              if (error) throw error;
              mediaId = newMedia.id;
            }
  
            // Add rating if exists
            if (item.user_rating) {
              await supabase.from('reviews').upsert({
                user_id: this.userId,
                media_id: mediaId,
                rating: item.user_rating,
                rated_at: item.rated_at,
                imported_from: 'imdb',
              });
            }
  
            // Add to watchlist if marked
            if (item.watchlist && watchlist) {
              await supabase.from('list_items').insert({
                list_id: watchlist.id,
                media_id: mediaId,
              });
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