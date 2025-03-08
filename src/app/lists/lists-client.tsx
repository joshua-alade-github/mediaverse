'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/client/supabase';
import Link from 'next/link';
import { Plus, Bookmark, ArrowRight, Loader2 } from 'lucide-react';

interface List {
  id: string;
  title: string;
  description: string;
  is_private: boolean;
  is_default: boolean;
  created_at: string;
  user_id: string;
  item_count?: number;
}

export function ListsClient() {
  const { user, loading: authLoading } = useAuth();
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      router.push('/auth/login?redirectTo=/lists');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const fetchLists = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const { data, error } = await supabase
            .from('lists')
            .select(`
              *,
              item_count:list_items(count)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          // Transform data to include item count
          const listsWithCount = data.map(list => ({
            ...list,
            item_count: list.item_count?.length ? list.item_count[0].count : 0
          }));

          setLists(listsWithCount);
        } catch (err: any) {
          console.error('Error fetching lists:', err);
          setError('Failed to load your lists. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchLists();
    }
  }, [user]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Lists</h1>
        <Link
          href="/lists/create"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New List
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      ) : lists.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <Bookmark className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No lists yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first list to organize your media.
          </p>
          <div className="mt-6">
            <Link
              href="/lists/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create List
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <Link 
              key={list.id} 
              href={`/lists/${list.id}`}
              className="block bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{list.title}</h3>
                    {list.is_default && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-1">
                        Default
                      </span>
                    )}
                    {list.is_private && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1 ml-1">
                        Private
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {list.item_count} item{list.item_count !== 1 ? 's' : ''}
                  </div>
                </div>
                {list.description && (
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">{list.description}</p>
                )}
                <div className="mt-4 flex items-center text-sm text-indigo-600">
                  View List
                  <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}