'use client';

import { useState, useEffect } from 'react';
import { getPopularAcrossServices } from '@/lib/services/media';
import { MediaCardWithAttribution } from './MediaCardWithAttribution';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { MediaReference, MediaType } from '@/types';

const mediaTypes = [
  { label: 'Movies', value: 'movie' },
  { label: 'Games', value: 'game' },
  { label: 'Books', value: 'book' },
  { label: 'Music', value: 'music' }
] as const;

export function PopularSection() {
  const [activeTab, setActiveTab] = useState<MediaType>('movie');
  const [popularData, setPopularData] = useState<Record<MediaType, MediaReference[]>>({
    movie: [],
    game: [],
    book: [],
    music: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPopularAcrossServices()
      .then(data => {
        setPopularData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error loading popular media:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[360px] bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MediaType)}>
      <TabsList className="flex space-x-1 mb-6">
        {mediaTypes.map(({ label, value }) => (
          <TabsTrigger key={value} value={value}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      {mediaTypes.map(({ value }) => (
        <TabsContent key={value} value={value}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {popularData[value].slice(0, 4).map((item) => (
              <MediaCardWithAttribution
                key={`${item.externalSource}-${item.externalId}`}
                media={item}
              />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}