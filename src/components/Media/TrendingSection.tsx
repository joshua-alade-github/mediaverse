'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Film, Tv, BookOpen, Gamepad2, Music, BookMarked } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { MediaCardWithAttribution } from '@/components/Media/MediaCardWithAttribution';
import { MediaType, MediaReference } from '@/types';

interface TrendingSectionProps {
  mediaType?: MediaType;
}

// A client-side only component that loads trending data
export function TrendingSection({ mediaType }: TrendingSectionProps) {
  // If a specific mediaType is provided (e.g., on /movies), use that as the active tab
  // and don't show tabs for other media types
  const [activeTab, setActiveTab] = useState<MediaType>(mediaType || 'movie');
  const [trendingData, setTrendingData] = useState<MediaReference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Load trending data for the active tab
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    
    apiClient.getTrendingMedia(activeTab)
      .then(data => {
        if (isMounted) {
          setTrendingData(data.slice(0, 4));
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error(`Error loading trending ${activeTab}:`, err);
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      });
      
    return () => {
      isMounted = false;
    };
  }, [activeTab]);
  
  const mediaTypes = [
    { label: 'Movies', value: 'movie' as const, icon: <Film className="h-5 w-5" /> },
    { label: 'TV Shows', value: 'tv_show' as const, icon: <Tv className="h-5 w-5" /> },
    { label: 'Games', value: 'game' as const, icon: <Gamepad2 className="h-5 w-5" /> },
    { label: 'Books', value: 'book' as const, icon: <BookOpen className="h-5 w-5" /> },
    { label: 'Music', value: 'music' as const, icon: <Music className="h-5 w-5" /> },
    { label: 'Comics', value: 'comic' as const, icon: <BookMarked className="h-5 w-5" /> }
  ];
  
  // If we're on a media-specific page, only show content for that media type, no tabs
  const showMediaTypeTabs = !mediaType;
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Only show media type tabs when not on a media-specific page */}
      {showMediaTypeTabs && (
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto py-2 px-4">
            {mediaTypes.map(({ label, value, icon }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md mr-2 whitespace-nowrap ${
                  activeTab === value
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-6">
        {isLoading ? (
          // Loading state - skeleton cards
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
                <div className="aspect-w-2 aspect-h-3 bg-gray-200 animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                </div>
                <div className="p-4">
                  <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-12 text-gray-500">
            <p>Error loading trending content.</p>
            <button 
              onClick={() => {
                setIsLoading(true);
                setError(null);
                apiClient.getTrendingMedia(activeTab)
                  .then(data => {
                    setTrendingData(data.slice(0, 4));
                    setIsLoading(false);
                  })
                  .catch(err => {
                    setError(err);
                    setIsLoading(false);
                  });
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        ) : trendingData.length === 0 ? (
          // No data state
          <div className="text-center py-12 text-gray-500">
            No trending content found
          </div>
        ) : (
          // Content state
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {trendingData.map((item) => (
              <MediaCardWithAttribution 
                key={`${item.externalSource}-${item.externalId}`}
                media={item}
              />
            ))}
          </div>
        )}
        
        <div className="mt-6 text-center">
          <Link
            href={`/${activeTab}`}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            See all trending {activeTab.replace('_', ' ')}s
            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}