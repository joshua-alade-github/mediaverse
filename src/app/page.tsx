import { Suspense } from 'react';

import { HomeClient } from './home-client';

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="space-y-10">
        <section>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to Mediaverse
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Discover, track, and discuss your favorite movies, shows, games, books, and more.
          </p>
        </section>
        <div className="h-96 animate-pulse rounded-lg bg-gray-100"></div>
      </div>
    }>
      <HomeClient />
    </Suspense>
  );
}
