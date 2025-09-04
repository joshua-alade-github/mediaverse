import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { MediaDetails } from '@/components/Media/MediaDetails';
import { RelatedMedia } from '@/components/Media/RelatedMedia';
import { MediaType } from '@/types';
import { serviceMap } from '@/lib/services/media';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface MediaPageProps {
  params: {
    mediaType: string;
    id: string;
  };
}

export default function MediaPage({ params: { mediaType, id } }: MediaPageProps) {
  if (!(mediaType in serviceMap)) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Suspense fallback={<LoadingSpinner />}>
        <MediaDetails id={id} mediaType={mediaType as MediaType} />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <RelatedMedia id={id} mediaType={mediaType as MediaType} />
      </Suspense>
    </div>
  );
}