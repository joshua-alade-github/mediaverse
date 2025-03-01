'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/client/supabase';

interface FilterSidebarProps {
  mediaType: string;
}

export function FilterSidebar({ mediaType }: FilterSidebarProps) {
  const [genres, setGenres] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchGenres = async () => {
      const { data } = await supabase
        .from('genres')
        .select('name')
        .eq('media_type', mediaType)
        .order('name');

      if (data) {
        setGenres(data.map(g => g.name));
      }
    };

    fetchGenres();
  }, [mediaType]);

  const handleFilterChange = (type: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(type, value);
    params.delete('page'); // Reset to first page when filters change
    router.push(`/${mediaType}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Sort By</h3>
        <div className="mt-2 space-y-2">
          {[
            { id: 'recent', label: 'Recently Added' },
            { id: 'rating', label: 'Highest Rated' },
            { id: 'title', label: 'Title (A-Z)' },
          ].map((option) => (
            <label key={option.id} className="flex items-center">
              <input
                type="radio"
                name="sort"
                value={option.id}
                checked={searchParams.get('sort') === option.id}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Genres</h3>
        <div className="mt-2 space-y-2">
          {genres.map((genre) => (
            <label key={genre} className="flex items-center">
              <input
                type="radio"
                name="genre"
                value={genre}
                checked={searchParams.get('genre') === genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">{genre}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}