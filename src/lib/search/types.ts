export interface SearchFilters {
  query?: string;
  mediaTypes?: string[];
  genres?: string[];
  minRating?: number;
  maxRating?: number;
  releaseYearStart?: number;
  releaseYearEnd?: number;
  sortBy?: 'rating' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}