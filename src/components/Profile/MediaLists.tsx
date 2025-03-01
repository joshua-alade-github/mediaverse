'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/client/supabase';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Plus } from 'lucide-react';

interface MediaListsProps {
  userId: string;
  limit?: number;
}

export function MediaLists({ userId, limit }: MediaListsProps) {
  const [page, setPage] = useState(1);
  const itemsPerPage = limit || 10;

  const { data, isLoading } = useQuery({
    queryKey: ['media-lists', userId, page, itemsPerPage],
    queryFn: async () => {
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage - 1;

      // Get lists with items count and first few items
      const { data: lists } = await supabase
        .from('lists')
        .select(`
          *,
          items:list_items(
            count,
            media:media(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(start, end);

      // Get total count for pagination
      const { count } = await supabase
        .from('lists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return {
        lists,
        totalCount: count || 0,
      };
    },
  });

  if (isLoading) {
    return <div>Loading lists...</div>;
  }

  if (!data?.lists?.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Lists Yet</h3>
        <p className="text-gray-500 mb-4">Create your first list to start organizing your media.</p>
        <Link 
          href="/lists/create" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create List
        </Link>
      </div>
    );
  }

  const totalPages = Math.ceil((data.totalCount || 0) / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Lists</h3>
        <Link
          href="/lists/create"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
        >
          <Plus className="h-4 w-4 mr-1" />
          New List
        </Link>
      </div>

      <div className="grid gap-6">
        {data.lists.map((list) => (
          <div
            key={list.id}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/lists/${list.id}`}
                    className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                  >
                    {list.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    {list.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {list.is_private ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-500">
                    {list.items?.[0]?.count || 0} items
                  </span>
                </div>
              </div>

              {list.items?.[0]?.count > 0 && (
                <div className="mt-4">
                  <div className="flex overflow-x-auto space-x-4 pb-2">
                    {list.items
                      .slice(0, 4)
                      .map((item: any) => (
                        <Link
                          key={item.media.id}
                          href={`/${item.media.media_type}/${item.media.id}`}
                          className="flex-none"
                        >
                          <div className="w-20 h-28 relative rounded-md overflow-hidden">
                            {item.media.cover_image ? (
                              <img
                                src={item.media.cover_image}
                                alt={item.media.title}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No image</span>
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    {list.items?.[0]?.count > 4 && (
                      <Link
                        href={`/lists/${list.id}`}
                        className="flex-none w-20 h-28 bg-gray-50 rounded-md flex items-center justify-center hover:bg-gray-100"
                      >
                        <div className="text-center">
                          <ArrowRight className="h-5 w-5 text-gray-400 mx-auto" />
                          <span className="text-xs text-gray-500 mt-1 block">
                            {list.items?.[0]?.count - 4} more
                          </span>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!limit && totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}