'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import { searchAllServices, serviceMap } from '@/lib/services/media';
import { MediaCardWithAttribution } from '@/components/Media/MediaCardWithAttribution';
import type { MediaReference, MediaType } from '@/types';

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') as MediaType | 'all' || 'all';

  const [query, setQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<MediaType | 'all'>(initialType);
  const [results, setResults] = useState<Record<MediaType, MediaReference[]>>({
    movie: [],
    game: [],
    book: [],
    music: []
  });
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialQuery && !hasSearched) {
      handleSearch();
    }
  }, [initialQuery]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      if (selectedType === 'all') {
        const allResults = await searchAllServices(query);
        setResults(allResults);
      } else {
        const allResults = await searchAllServices(query, [selectedType]);
        setResults(prev => ({ ...prev, [selectedType]: allResults[selectedType] }));
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getFilteredResults = () => {
    if (selectedType === 'all') {
      return Object.entries(results).flatMap(([type, items]) => 
        items.map(item => ({ ...item, mediaType: type as MediaType }))
      );
    }
    return results[selectedType] || [];
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for movies, games, books, or music..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              <SearchIcon className="h-5 w-5" />
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {Object.keys(serviceMap).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as MediaType)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  selectedType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'game' ? 'Games' : type === 'movie' ? 'Movies' : type === 'book' ? 'Books' : 'Music'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          {isSearching ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            </div>
          ) : filteredResults.length > 0 ? (
            <>
              <h2 className="text-lg font-semibold mb-4">
                {filteredResults.length} results for "{query}"
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredResults.map((item) => (
                  <MediaCardWithAttribution
                    key={`${item.externalSource}-${item.externalId}`}
                    media={item}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No results found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}