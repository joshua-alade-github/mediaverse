import Papa from 'papaparse';
import { z } from 'zod';

const letterboxdSchema = z.object({
  'Name': z.string(),
  'Year': z.string(),
  'Rating': z.string().optional(),
  'Review': z.string().optional(),
  'Watched Date': z.string().optional(),
  'Tags': z.string().optional(),
});

export function parseLetterboxdExport(content: string) {
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
      const validatedRow = letterboxdSchema.parse(row);
      results.valid.push({
        title: validatedRow.Name,
        year: parseInt(validatedRow.Year),
        user_rating: validatedRow.Rating
          ? parseFloat(validatedRow.Rating) * 2 // Convert 5-star to 10-point scale
          : null,
        review: validatedRow.Review || null,
        watched_at: validatedRow['Watched Date']
          ? new Date(validatedRow['Watched Date'])
          : null,
        tags: validatedRow.Tags
          ? validatedRow.Tags.split(',').map((tag) => tag.trim())
          : [],
      });
    } catch (error) {
      results.invalid.push({ row, error });
    }
  });

  return results;
}