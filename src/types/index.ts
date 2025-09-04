export type MediaType = 'movie' | 'game' | 'book' | 'music';

export type ExternalSourceType = 
  | 'tmdb'
  | 'igdb'
  | 'google_books'
  | 'lastfm'
  | 'rawg'
  | 'spotify';

export interface Attribution {
  source: string;
  sourceUrl: string;
  license?: string;
  timestamp?: string;
}

export interface MediaReference {
  externalId: string;
  externalSource: ExternalSourceType;
  title: string;
  description?: string;
  mediaType: MediaType;
  releaseDate?: Date;
  coverImage?: string;
  averageRating?: number;
  totalReviews?: number;
  attribution: Attribution;
  referenceData?: Record<string, any>;
}

export interface SearchFilters {
  query?: string;
  mediaTypes?: MediaType[];
  genres?: string[];
  minRating?: number;
  maxRating?: number;
  releaseYearStart?: number;
  releaseYearEnd?: number;
  sortBy?: 'rating' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  url: string;
  publishedAt: string;
  source: string;
  type: 'upcoming_release' | 'game_update' | 'new_release' | 'news';
}