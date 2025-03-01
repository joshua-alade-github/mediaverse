import { BaseImporter, ImportResult } from './base';
import { parseMediaverseBackup } from '../parsers/mediaverse';

export class MediaverseImporter extends BaseImporter {
  async import(content: string): Promise<ImportResult> {
    const supabase = createClient();
    const result: ImportResult = {
      succeeded: 0,
      failed: 0,
      errors: [],
    };

    try {
      const data = parseMediaverseBackup(content);

      // Import lists
      if (data.lists) {
        for (const list of data.lists) {
          try {
            // Create list
            const { data: newList } = await supabase
              .from('lists')
              .insert({
                user_id: this.userId,
                title: list.title,
                description: list.description,
                is_private: list.is_private,
              })
              .select('id')
              .single();

            // Add items to list
            if (newList && list.items.length > 0) {
              await supabase.from('list_items').insert(
                list.items.map((item) => ({
                  list_id: newList.id,
                  media_id: item.media_id,
                  added_at: item.added_at,
                }))
              );
            }

            result.succeeded++;
          } catch (error) {
            result.failed++;
            result.errors.push(
              `Failed to import list ${list.title}: ${error.message}`
            );
          }
        }
      }

      // Import reviews
      if (data.reviews) {
        for (const review of data.reviews) {
          try {
            await supabase.from('reviews').insert({
              user_id: this.userId,
              media_id: review.media_id,
              rating: review.rating,
              content: review.content,
              created_at: review.created_at,
            });

            result.succeeded++;
          } catch (error) {
            result.failed++;
            result.errors.push(
              `Failed to import review for media ${review.media_id}: ${error.message}`
            );
          }
        }
      }

      // Import preferences
      if (data.preferences) {
        try {
          await supabase
            .from('user_preferences')
            .upsert({
              user_id: this.userId,
              preferences: data.preferences,
            });

          result.succeeded++;
        } catch (error) {
          result.failed++;
          result.errors.push(
            `Failed to import preferences: ${error.message}`
          );
        }
      }
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }

    return result;
  }
}