'use client';

import { MediaCard } from './MediaCard';

interface MediaGridProps {
  items: {
    id: string;
    title: string;
    averageRating?: number | null;
    totalReviews?: number;
    [key: string]: any;
  }[];
}

export function MediaGrid({ items }: MediaGridProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No media found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <MediaCard key={item.id} media={item} />
      ))}
    </div>
  );
}
