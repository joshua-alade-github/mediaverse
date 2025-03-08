'use client';

import { supabase } from '@/lib/client/supabase';
import { validateEmail, validatePassword, validateUsername } from '@/utils/validation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;

    // Validate inputs
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (!validateUsername(username)) {
      setError('Username must be between 3-20 characters and only contain letters, numbers, and underscores');
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Starting signup process...');
      
      // Check if Supabase configuration is available
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Supabase configuration is missing');
        throw new Error('Application configuration error. Please contact support.');
      }
      
      // Create auth user
      console.log('Attempting to create user with Supabase Auth...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }

      console.log('Auth response:', authData);

      // Check if user is created
      if (authData && authData.user) {
        console.log('User created successfully, creating profile...');
        
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            username,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }

        // Create default lists
        console.log('Creating default lists...');
        const defaultLists = [
          { title: 'Watchlist', is_default: true },
          { title: 'Favorites', is_default: true },
          { title: 'Currently Watching', is_default: true },
          { title: 'Completed', is_default: true },
        ];

        const { error: listsError } = await supabase
          .from('lists')
          .insert(defaultLists.map(list => ({
            ...list,
            user_id: authData.user.id,
          })));

        if (listsError) {
          console.error('Lists creation error:', listsError);
          throw listsError;
        }

        console.log('Signup complete, redirecting...');
        
        // Store email in localStorage for the verification page
        if (typeof window !== 'undefined') {
          localStorage.setItem('signupEmail', email);
        }
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        console.error('User object missing in auth response');
        throw new Error('User creation failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      
      // Check for network errors
      if (err.message?.includes('Failed to fetch')) {
        setError('Cannot connect to authentication service. Please check your internet connection and make sure Supabase is properly configured.');
      } else {
        setError(err.message || 'An error occurred during sign up');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Or{' '}
          <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500">
            sign in to your account
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  );
}