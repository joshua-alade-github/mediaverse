import { z } from 'zod';

export const mediaSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  mediaType: z.enum(['movie', 'tv_show', 'book', 'game', 'music', 'comic', 'manga', 'anime']),
  releaseDate: z.string().optional(),
  coverImage: z.string().optional(),
});

export const reviewSchema = z.object({
  mediaId: z.string().uuid(),
  rating: z.number().min(1).max(10),
  content: z.string().optional(),
});

export const listSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
  isDefault: z.boolean().default(false),
});

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment is required'),
  parentId: z.string().uuid().optional(),
});

export const achievementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string(),
  conditionType: z.string(),
  conditionValue: z.record(z.any()),
  iconName: z.string(),
  points: z.number().min(0),
});