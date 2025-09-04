import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { MediaDetails } from '@/components/Media/MediaDetails';
import { MediaType } from '@/types';
import { serviceMap } from '@/lib/services/media';

interface MediaPageProps {
  params: {
    mediaType: string;
    id: string;
  };
}

export default function MediaPage({ params: { mediaType, id } }: MediaPageProps) {
  // Validate media type
  if (!(mediaType in serviceMap)) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Suspense fallback={
        <div className="h-96 bg-white rounded-lg shadow animate-pulse" />
      }>
        <MediaDetails id={id} mediaType={mediaType as MediaType} />
      </Suspense>
    </div>
  );
}