import type { Media, MediaReference, MediaType } from './index';

export interface APIResponse<T> {
  data: T;
  error: string | null;
}

export interface SearchResponse {
  local: Media[];
  external: Record<MediaType, MediaReference[]>;
  total: number;
}

export interface ImportResponse {
  media: Media;
  externalReference: {
    id: string;
    externalId: string;
    externalSource: string;
  };
}

export interface ErrorResponse {
  error: string;
  details?: unknown;
}

export type SearchParams = {
  query?: string;
  mediaTypes?: MediaType[];
  includeExternal?: boolean;
  page?: number;
  limit?: number;
};

export type ImportParams = {
  mediaType: MediaType;
  externalId: string;
  userId?: string;
};

export interface MediaDetailsResponse {
  media: Media;
  externalData?: MediaReference;
}