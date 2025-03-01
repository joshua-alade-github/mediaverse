import { z } from 'zod';

const mediaverseBackupSchema = z.object({
  lists: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    is_private: z.boolean(),
    items: z.array(z.object({
      media_id: z.string(),
      added_at: z.string(),
    })),
  })).optional(),
  reviews: z.array(z.object({
    media_id: z.string(),
    rating: z.number().min(1).max(10),
    content: z.string().optional(),
    created_at: z.string(),
  })).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    contentLanguages: z.array(z.string()),
    defaultListPrivacy: z.enum(['public', 'private']),
  }).optional(),
});

export function parseMediaverseBackup(content: string) {
  try {
    const data = JSON.parse(content);
    return mediaverseBackupSchema.parse(data);
  } catch (error) {
    throw new Error('Invalid backup file format');
  }
}