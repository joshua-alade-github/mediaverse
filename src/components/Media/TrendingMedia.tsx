'use client';

import { useState, useEffect } from 'react';
import { getTrendingAcrossServices } from '@/lib/services/media';
import { MediaCardWithAttribution } from './MediaCardWithAttribution';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { MediaReference, MediaType } from '@/types';

const mediaTypes = [
  { label: 'Movies', value: 'movie' },
  { label: 'Games', value: 'game' },
  { label: 'Books', value: 'book' },
  { label: 'Music', value: 'music' }
] as const;

export function TrendingMedia() {
  const [activeTab, setActiveTab] = useState<MediaType>('movie');
  const [trendingData, setTrendingData] = useState<Record<MediaType, MediaReference[]>>({
    movie: [],
    game: [],
    book: [],
    music: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchTrending = async () => {
      try {
        const data = await getTrendingAcrossServices();
        if (mounted) {
          setTrendingData(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading trending:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTrending();
    
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-72 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MediaType)}>
      <TabsList className="flex space-x-1 mb-4 overflow-x-auto">
        {mediaTypes.map(({ label, value }) => (
          <TabsTrigger key={value} value={value} className="whitespace-nowrap">
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      {mediaTypes.map(({ value }) => (
        <TabsContent key={value} value={value}>
          {trendingData[value].length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {trendingData[value].slice(0, 4).map((item) => (
                <MediaCardWithAttribution
                  key={`${item.externalSource}-${item.externalId}`}
                  media={item}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No trending {value === 'game' ? 'games' : value + 's'} available
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}