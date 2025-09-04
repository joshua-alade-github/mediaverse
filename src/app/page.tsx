'use client';

import { MediaTypeGrid } from '@/components/Media/MediaTypeGrid';
import { TrendingMedia } from '@/components/Media/TrendingMedia';
import { PopularSection } from '@/components/Media/PopularSection';
import { UpcomingReleases } from '@/components/Media/UpcomingReleases';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Welcome to Mediaverse
          </h1>
          <p className="text-lg text-gray-600">
            Discover movies, games, books, and music from around the world.
          </p>
        </section>

        {/* Media Type Grid */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Explore Categories</h2>
          <MediaTypeGrid />
        </section>

        {/* Trending Now */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Trending Now</h2>
          <TrendingMedia />
        </section>

        {/* Popular This Week */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular This Week</h2>
          <PopularSection />
        </section>

        {/* Upcoming Releases */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Releases</h2>
          <UpcomingReleases />
        </section>
      </div>
    </div>
  );
}