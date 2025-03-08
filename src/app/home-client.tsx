'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { TrendingSection } from '@/components/Media/TrendingSection';
import { MediaTypeGrid } from '@/components/Media/MediaTypeGrid';
import { SearchBar } from '@/components/Search/SearchBar';
import { 
  Film, 
  Tv, 
  BookOpen, 
  Gamepad2, 
  Music, 
  BookMarked, 
  Loader2 
} from 'lucide-react';

export function HomeClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect logged in users to dashboard
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // If user is logged in, they will be redirected. Only show the landing page to non-logged in users.
  if (user) {
    return null;
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-12 px-4 sm:px-6 lg:px-8 bg-white rounded-xl shadow-sm">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Your universe of media
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-xl text-gray-500">
          Track, organize, and discover movies, TV shows, books, games, and more all in one place.
        </p>
        <div className="mt-8">
          <div className="max-w-md mx-auto">
            <SearchBar />
          </div>
          <div className="mt-4 flex justify-center space-x-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>

      {/* Media Types */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          All your media in one place
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mx-auto">
              <Film className="h-8 w-8" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">Movies</h3>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 text-purple-600 mx-auto">
              <Tv className="h-8 w-8" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">TV Shows</h3>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 text-yellow-600 mx-auto">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">Books</h3>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mx-auto">
              <Gamepad2 className="h-8 w-8" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">Games</h3>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 mx-auto">
              <Music className="h-8 w-8" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">Music</h3>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mx-auto">
              <BookMarked className="h-8 w-8" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">Comics</h3>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Features that make tracking fun
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Track Your Media</h3>
            <p className="text-gray-600">
              Log your watching, reading, and playing activities. Mark items as complete, in progress, or add to your watchlist.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Create Custom Lists</h3>
            <p className="text-gray-600">
              Organize your media into custom lists. Create watchlists, favorites, or theme-based collections.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Rate and Review</h3>
            <p className="text-gray-600">
              Share your thoughts on movies, books, and more. Rate what you've experienced and write detailed reviews.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Discover New Content</h3>
            <p className="text-gray-600">
              Find new media based on your preferences. Get personalized recommendations and explore trending content.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Follow Friends</h3>
            <p className="text-gray-600">
              Connect with friends and see what they're watching, reading, and playing. Share recommendations.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Track Your Progress</h3>
            <p className="text-gray-600">
              Monitor your viewing, reading, and gaming habits with detailed statistics and visualization of your activity.
            </p>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Trending Now
        </h2>
        <TrendingSection />
      </div>

      {/* Browse By Category */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Browse by Category
        </h2>
        <MediaTypeGrid />
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700 rounded-xl shadow-lg overflow-hidden">
        <div className="max-w-3xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to start tracking?</span>
            <span className="block">Create your account today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Join thousands of users tracking their favorite media. It's free to get started!
          </p>
          <Link
            href="/auth/signup"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
          >
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
}