'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { getServiceForType, serviceMap } from '@/lib/services/media';
import { SearchFilters, MediaType } from '@/types';
import { MediaGrid } from '@/components/Media/MediaGrid';

interface AdvancedSearchProps {
  initialQuery?: string;
  initialType?: MediaType;
  initialGenre?: string;
  initialSort?: string;
}

export function AdvancedSearch({
  initialQuery = '',
  initialType = 'movie',
  initialGenre,
  initialSort = 'rating-desc',
}: AdvancedSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({
    query: initialQuery,
    mediaTypes: [initialType],
    genres: initialGenre ? [initialGenre] : [],
    sortBy: initialSort.split('-')[0] as 'rating' | 'date' | 'title',
    sortOrder: initialSort.split('-')[1] as 'asc' | 'desc',
  });

  const [shouldSearch, setShouldSearch] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Search results from selected service
  const { data: searchResults, isLoading, refetch } = useQuery({
    queryKey: ['service-search', filters],
    queryFn: async () => {
      const service = getServiceForType(filters.mediaTypes[0]);
      const results = await service.searchMedia(query || '');

      // Apply sorting
      return results.sort((a, b) => {
        switch (filters.sortBy) {
          case 'rating':
            const ratingA = a.averageRating || 0;
            const ratingB = b.averageRating || 0;
            return filters.sortOrder === 'desc' ? ratingB - ratingA : ratingA - ratingB;
          case 'date':
            const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
            const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
            return filters.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
          case 'title':
            return filters.sortOrder === 'desc' 
              ? b.title.localeCompare(a.title)
              : a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
    },
    enabled: shouldSearch && Boolean(query),
  });

  // Reset shouldSearch after query completes
  useEffect(() => {
    if (shouldSearch && !isLoading) {
      setShouldSearch(false);
    }
  }, [isLoading, shouldSearch]);

  const handleSearch = () => {
    setShouldSearch(true);
    setHasChanges(false);
    setFilters(prev => ({ ...prev, query }));
    refetch();
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setHasChanges(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-6">Filters</h3>

          {/* Search Input */}
          <form onSubmit={handleSubmit} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Query
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHasChanges(true);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter search terms..."
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </form>

          {/* Filter Groups */}
          <div className="space-y-6 divide-y divide-gray-200">
            {/* Service Selection */}
            <div className="pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service
              </label>
              <select
                value={filters.mediaTypes[0]}
                onChange={(e) => updateFilters({ mediaTypes: [e.target.value as MediaType] })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {Object.keys(serviceMap).map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Range */}
            <div className="pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating Range
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={filters.minRating || ''}
                  onChange={(e) => updateFilters({
                    minRating: parseInt(e.target.value) || undefined,
                  })}
                  className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span>to</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={filters.maxRating || ''}
                  onChange={(e) => updateFilters({
                    maxRating: parseInt(e.target.value) || undefined,
                  })}
                  className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  updateFilters({
                    sortBy: sortBy as typeof filters.sortBy,
                    sortOrder: sortOrder as typeof filters.sortOrder,
                  });
                }}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="rating-desc">Highest Rated</option>
                <option value="rating-asc">Lowest Rated</option>
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          {hasChanges && (
            <div className="pt-6">
              <button
                onClick={handleSearch}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Search
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-3">
        {isLoading ? (
          <div>Loading results...</div>
        ) : !searchResults || searchResults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No results found</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {searchResults.length} results found
              </p>
            </div>
            <MediaGrid items={searchResults} />
          </div>
        )}
      </div>
    </div>
  );
}