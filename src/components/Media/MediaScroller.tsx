'use client';

import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaType } from '@/types';
import { apiClient } from '@/lib/api/client';
import { MediaCardWithAttribution } from './MediaCardWithAttribution';

interface MediaScrollerProps {
  mediaType?: MediaType;
  limit?: number;
}

export function MediaScroller({ mediaType, limit = 10 }: MediaScrollerProps) {
  const [trendingMedia, setTrendingMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const trending = await apiClient.getTrendingMedia();
        // Filter by media type if specified
        const filtered = mediaType 
          ? trending.filter(item => item.mediaType === mediaType)
          : trending;
        setTrendingMedia(filtered.slice(0, limit));
      } catch (error) {
        console.error('Error fetching trending media:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [mediaType, limit]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = container.offsetWidth * 0.8;
    
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (trendingMedia.length === 0) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-500">
        No trending media available
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
        disabled={!scrollContainerRef.current || scrollContainerRef.current.scrollLeft === 0}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
        disabled={
          !scrollContainerRef.current || 
          scrollContainerRef.current.scrollLeft >= 
          scrollContainerRef.current.scrollWidth - scrollContainerRef.current.offsetWidth
        }
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Scrolling container */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide gap-4 pb-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {trendingMedia.map((media, index) => (
          <div 
            key={media.id || `trending-${index}`}
            className="flex-none w-72"
            style={{ scrollSnapAlign: 'start' }}
          >
            <MediaCardWithAttribution
              media={media}
              priority={index < 3} // Prioritize loading first 3 images
            />
          </div>
        ))}
      </div>
    </div>
  );
}