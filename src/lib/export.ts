import { createClient } from '@/lib/supabase';
import { Parser } from 'json2csv';

export async function exportUserData(
  jobId: string,
  userId: string,
  exportTypes: string[]
) {
  const supabase = createClient();

  try {
    const data: Record<string, any> = {};

    // Collect user data based on export types
    for (const type of exportTypes) {
      switch (type) {
        case 'lists': {
          const { data: lists } = await supabase
            .from('lists')
            .select(`
              *,
              items:list_items(
                media:media(*)
              )
            `)
            .eq('user_id', userId);
          data.lists = lists;
          break;
        }
        case 'reviews': {
          const { data: reviews } = await supabase
            .from('reviews')
            .select(`
              *,
              media:media(title, media_type)
            `)
            .eq('user_id', userId);
          data.reviews = reviews;
          break;
        }
        case 'ratings': {
          const { data: ratings } = await supabase
            .from('reviews')
            .select('media_id, rating')
            .eq('user_id', userId);
          data.ratings = ratings;
          break;
        }
        // Add more export types as needed
      }
    }

    // Convert to CSV if requested
    let fileContent: string;
    let contentType: string;
    let fileName: string;

    if (exportTypes.length === 1) {
      // Single type export as CSV
      const parser = new Parser();
      fileContent = parser.parse(data[exportTypes[0]]);
      contentType = 'text/csv';
      fileName = `${exportTypes[0]}_export.csv`;
    } else {
      // Multiple types export as JSON
      fileContent = JSON.stringify(data, null, 2);
      contentType = 'application/json';
      fileName = 'mediaverse_export.json';
    }

    // Upload file to storage
    const { data: upload, error: uploadError } = await supabase.storage
      .from('exports')
      .upload(
        `${userId}/${jobId}/${fileName}`,
        fileContent,
        {
          contentType,
          cacheControl: '3600',
        }
      );

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from('exports')
      .getPublicUrl(`${userId}/${jobId}/${fileName}`);

    // Update export job
    await supabase
      .from('data_exports')
      .update({
        status: 'completed',
        file_url: publicUrl.publicUrl,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

  } catch (error) {
    // Update export job with error
    await supabase
      .from('data_exports')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Export failed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  }
}