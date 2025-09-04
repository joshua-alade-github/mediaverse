import { MediaReference } from "./base";

export interface ExternalMediaResult {
  id: string;
  title: string;
  description?: string;
  releaseDate?: Date;
  coverImage?: string;
  genres?: string[];
  creators?: Array<{
    name: string;
    role: string;
  }>;
  externalRating?: number;
  externalId: string;
  externalSource: string;
}

export interface ExternalSearchResult {
  source: string;
  results: MediaReference[];
  hasMore: boolean;
  totalCount?: number;
}

export interface TMDBSearchOptions {
  type?: 'movie' | 'tv';
  page?: number;
  includeAdult?: boolean;
  language?: string;
  region?: string;
}

export interface TMDBDetailsOptions {
  type: 'movie' | 'tv';
  appendToResponse?: string[];
  language?: string;
}

export interface RAWGSearchOptions {
  platforms?: string[];
  genres?: string[];
  ordering?: 'name' | 'released' | 'added' | 'created' | 'updated' | 'rating' | 'metacritic';
  page?: number;
  pageSize?: number;
}

export interface GoogleBooksSearchOptions {
  printType?: 'all' | 'books' | 'magazines';
  orderBy?: 'relevance' | 'newest';
  langRestrict?: string;
  maxResults?: number;
}

export interface LastFMSearchOptions {
  type?: 'album' | 'artist' | 'track';
  limit?: number;
  page?: number;
}

export interface LastFMDetailsOptions {
  type: 'album' | 'artist' | 'track';
  mbid?: string;
  artist?: string;
  album?: string;
  track?: string;
}