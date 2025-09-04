'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Star, Calendar, Search } from 'lucide-react';
import { getServiceForType } from '@/lib/services/media';
import { MediaCardWithAttribution } from './MediaCardWithAttribution';
import type { MediaType, MediaReference, NewsItem } from '@/types';

interface MediaPageContentProps {
  mediaType: MediaType;
}

export function MediaPageContent({ mediaType }: MediaPageContentProps) {
  const [trending, setTrending] = useState<MediaReference[]>([]);
  const [popular, setPopular] = useState<MediaReference[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [searchResults, setSearchResults] = useState<MediaReference[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const formattedType = mediaType === 'game' ? 'Games' : 
                        mediaType === 'movie' ? 'Movies' : 
                        mediaType === 'book' ? 'Books' : 'Music';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const service = getServiceForType(mediaType);
        
        const [trendingData, popularData, newsData] = await Promise.all([
          service.getTrendingMedia(),
          service.getPopularMedia(),
          mediaType === 'movie' || mediaType === 'game' 
            ? service.getLatestNews(6)
            : service.getNewReleases(6)
        ]);

        setTrending(trendingData.slice(0, 8));
        setPopular(popularData.slice(0, 8));
        setNews(newsData);
      } catch (error) {
        console.error(`Error loading ${mediaType} data:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mediaType]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const service = getServiceForType(mediaType);
      const results = await service.searchMedia(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-4">{formattedType}</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={`Search ${formattedType.toLowerCase()}...`}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Search className="h-5 w-5" />
            Search
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Results for "{searchQuery}"
            </h2>
            <button
              onClick={() => {
                setSearchResults([]);
                setSearchQuery('');
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {searchResults.slice(0, 8).map((item) => (
              <MediaCardWithAttribution
                key={`${item.externalSource}-${item.externalId}`}
                media={item}
              />
            ))}
          </div>
        </section>
      )}

      {/* Trending Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Trending {formattedType}
          </h2>
        </div>
        {trending.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {trending.map((item) => (
              <MediaCardWithAttribution
                key={`${item.externalSource}-${item.externalId}`}
                media={item}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No trending {formattedType.toLowerCase()} found</p>
        )}
      </section>

      {/* Popular Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Popular {formattedType}
          </h2>
        </div>
        {popular.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {popular.map((item) => (
              <MediaCardWithAttribution
                key={`${item.externalSource}-${item.externalId}`}
                media={item}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No popular {formattedType.toLowerCase()} found</p>
        )}
      </section>

      {/* News/Upcoming Section */}
      {news.length > 0 && (
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              {mediaType === 'movie' || mediaType === 'game' ? 'Upcoming Releases' : 'New Releases'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {news.map((article) => (
              <Link
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 transition-colors"
              >
                {article.imageUrl && (
                  <div className="aspect-video bg-gray-200">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 line-clamp-2">
                    {article.title}
                  </h3>
                  {article.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {article.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}