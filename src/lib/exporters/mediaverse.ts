import { BaseExporter, ExportOptions } from './base';
import { createClient } from '@/lib/supabase';
import { Parser } from 'json2csv';

export class MediaverseExporter extends BaseExporter {
  async export(options: ExportOptions): Promise<string> {
    const supabase = createClient();
    const data: Record<string, any> = {};

    // Fetch lists if requested
    if (options.types.includes('lists')) {
      const { data: lists } = await supabase
        .from('lists')
        .select(`
          *,
          items:list_items(
            media_id,
            added_at,
            media:media(*)
          )
        `)
        .eq('user_id', this.userId);

      data.lists = lists;
    }

    // Fetch reviews if requested
    if (options.types.includes('reviews')) {
      const { data: reviews } = await supabase
        .from('reviews')
        .select(`
          *,
          media:media(*)
        `)
        .eq('user_id', this.userId);

      data.reviews = reviews;
    }

    // Fetch ratings if requested
    if (options.types.includes('ratings')) {
      const { data: ratings } = await supabase
        .from('reviews')
        .select('media_id, rating, created_at')
        .eq('user_id', this.userId);

      data.ratings = ratings;
    }

    // Fetch preferences if requested
    if (options.types.includes('preferences')) {
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', this.userId)
        .single();

      data.preferences = preferences?.preferences;
    }

    // Return data in requested format
    if (options.format === 'csv') {
      const csvData = this.convertToCSV(data, options.types);
      return csvData;
    }

    return JSON.stringify(data, null, 2);
  }

  private convertToCSV(data: Record<string, any>, types: string[]): string {
    const csvData: Record<string, string> = {};

    // Convert each data type to CSV
    types.forEach((type) => {
      if (data[type]) {
        switch (type) {
          case 'lists': {
            const listItems = data.lists.flatMap((list: any) =>
              list.items.map((item: any) => ({
                list_title: list.title,
                media_title: item.media.title,
                media_type: item.media.media_type,
                added_at: item.added_at,
              }))
            );
            const parser = new Parser();
            csvData[type] = parser.parse(listItems);
            break;
          }
          case 'reviews': {
            const reviews = data.reviews.map((review: any) => ({
              media_title: review.media.title,
              media_type: review.media.media_type,
              rating: review.rating,
              content: review.content,
              created_at: review.created_at,
            }));
            const parser = new Parser();
            csvData[type] = parser.parse(reviews);
            break;
          }
          // Add more conversions as needed
        }
      }
    });

    return Object.entries(csvData)
      .map(([type, csv]) => `# ${type}\n${csv}`)
      .join('\n\n');
  }
}