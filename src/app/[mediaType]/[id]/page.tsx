import { MediaDetails } from '@/components/Media/MediaDetails';
import { RelatedMedia } from '@/components/Media/RelatedMedia';
import { ReviewSection } from '@/components/Reviews/ReviewSection';
import { CommunityPosts } from '@/components/Social/CommunityPosts';
import { serviceMap } from '@/lib/services/media';
import { MediaType } from '@/types';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
            <Suspense fallback={
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            }>
              <ReviewSection mediaId={id} />
            </Suspense>
          </section>

          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Discussion</h2>
            <Suspense fallback={
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            }>
              <CommunityPosts mediaId={id} mediaType={mediaType} />
            </Suspense>
          </section>
        </div>

        <div>
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
            <Suspense fallback={
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            }>
              <RelatedMedia 
                mediaId={id} 
                mediaType={mediaType as MediaType}
              />
            </Suspense>
          </section>
        </div>
      </div>
    </div>
  );
}