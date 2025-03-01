'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { apiClient } from '@/lib/api/client';
import type { MediaType } from '@/types';

interface NewsGridProps {
  mediaType: MediaType;
  limit?: number;
}

export function NewsGrid({ mediaType, limit = 6 }: NewsGridProps) {
  const { data: news, isLoading, error } = useQuery({
    queryKey: ['latest-news', mediaType, limit],
    queryFn: () => apiClient.getLatestNews(mediaType, { limit })
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading news...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading news</div>;
  }

  if (!news || news.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No news found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {news.map((article) => (
        <Link
          key={article.id}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 transition-colors"
        >
          <div className="relative w-full pt-[56.25%]">
            {article.imageUrl ? (
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
              {article.title}
            </h3>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {article.description}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{article.source}</span>
              <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}