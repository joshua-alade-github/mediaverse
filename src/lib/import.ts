import { createClient } from '@/lib/supabase';
import Papa from 'papaparse';

interface ImportStats {
  processed: number;
  succeeded: number;
  failed: number;
  errors: string[];
}

export async function importUserData(
  jobId: string,
  filePath: string,
  source: string,
  type: string
) {
  const supabase = createClient();
  const stats: ImportStats = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Get file from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('imports')
      .download(filePath);

    if (fileError) throw fileError;

    const content = await fileData.text();

    switch (source) {
      case 'imdb': {
        await handleImdbImport(content, type, stats);
        break;
      }
      case 'letterboxd': {
        await handleLetterboxdImport(content, type, stats);
        break;
      }
      case 'mediaverse': {
        await handleMediaverseImport(content, type, stats);
        break;
      }
      default:
        throw new Error('Unsupported import source');
    }

    // Update import job with success
    await supabase
      .from('data_imports')
      .update({
        status: 'completed',
        stats,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

  } catch (error) {
    // Update import job with error
    await supabase
      .from('data_imports')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Import failed',
        stats,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  }
}

async function handleImdbImport(content: string, type: string, stats: ImportStats) {
  const supabase = createClient();
  
  // Parse CSV content
  const { data } = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
  });

  for (const row of data) {
    stats.processed++;
    try {
      // Find or create media entry
      const { data: media } = await supabase
        .from('media')
        .select('id')
        .eq('title', row['Title'])
        .eq('media_type', type)
        .single();

      if (media) {
        // Add rating if exists
        if (row['Your Rating']) {
          await supabase
            .from('reviews')
            .insert({
              media_id: media.id,
              rating: parseInt(row['Your Rating']),
              imported_from: 'imdb',
            });
        }

        // Add to watchlist if marked
        if (row['Watchlist'] === 'Yes') {
          await supabase
            .from('list_items')
            .insert({
              list_id: 'watchlist',
              media_id: media.id,
            });
        }

        stats.succeeded++;
      } else {
        throw new Error(`Media not found: ${row['Title']}`);
      }
    } catch (error) {
      stats.failed++;
      stats.errors.push(`Failed to import ${row['Title']}: ${error.message}`);
    }
  }
}

// Similar implementations for other import sources...
// handleLetterboxdImport
// handleMediaverseImport