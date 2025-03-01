import Papa from 'papaparse';
import { z } from 'zod';

const imdbMovieSchema = z.object({
  'Title': z.string(),
  'Year': z.string(),
  'IMDb Rating': z.string().optional(),
  'Your Rating': z.string().optional(),
  'Date Rated': z.string().optional(),
  'Watchlist': z.string().optional(),
});

export function parseImdbExport(content: string) {
  const { data } = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
  });

  const results = {
    valid: [] as any[],
    invalid: [] as any[],
  };

  data.forEach((row) => {
    try {
      const validatedRow = imdbMovieSchema.parse(row);
      results.valid.push({
        title: validatedRow.Title,
        year: parseInt(validatedRow.Year),
        imdb_rating: validatedRow['IMDb Rating'] 
          ? parseFloat(validatedRow['IMDb Rating']) 
          : null,
        user_rating: validatedRow['Your Rating']
          ? parseInt(validatedRow['Your Rating'])
          : null,
        rated_at: validatedRow['Date Rated']
          ? new Date(validatedRow['Date Rated'])
          : null,
        watchlist: validatedRow.Watchlist === 'Yes',
      });
    } catch (error) {
      results.invalid.push({ row, error });
    }
  });

  return results;
}