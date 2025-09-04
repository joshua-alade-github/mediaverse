import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { MediaType } from '@/types';
import { serviceMap } from '@/lib/services/media';
import { MediaPageContent } from '@/components/Media/MediaPageContent';

interface MediaTypePageProps {
  params: { mediaType: string };
}

export default function MediaTypePage({
  params: { mediaType },
}: MediaTypePageProps) {
  if (!(mediaType in serviceMap)) {
    notFound();
  }

  const validatedMediaType = mediaType as MediaType;

  return (
    <Suspense fallback={<div className="animate-pulse h-screen bg-gray-50" />}>
      <MediaPageContent mediaType={validatedMediaType} />
    </Suspense>
  );
}