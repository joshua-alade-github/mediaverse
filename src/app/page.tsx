import { Suspense } from 'react';
import { MediaTypeGrid } from '@/components/Media/MediaTypeGrid';
import { TrendingMedia } from '@/components/Media/TrendingMedia';
import { PopularMedia } from '@/components/Lists/PopularMedia';
import { ActiveCommunities } from '@/components/Social/ActiveCommunities';

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Welcome to Mediaverse
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Discover, track, and discuss your favorite movies, shows, games, books, and more.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Categories</h2>
        <MediaTypeGrid />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending Now</h2>
        <Suspense fallback={<div>Loading trending media...</div>}>
          <TrendingMedia />
        </Suspense>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Lists</h2>
          <Suspense fallback={<div>Loading popular lists...</div>}>
            <PopularMedia />
          </Suspense>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Communities</h2>
          <Suspense fallback={<div>Loading communities...</div>}>
            {/* <ActiveCommunities /> */}
          </Suspense>
        </section>
      </div>
    </div>
  );
}