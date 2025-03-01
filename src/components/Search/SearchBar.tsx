'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { serviceMap } from '@/lib/services/media';
import { MediaType } from '@/types';
import { SearchSuggestions } from './SearchSuggestions';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [selectedService, setSelectedService] = useState<MediaType>('movie');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}&type=${selectedService}`);
    }
  };

  const handleNavigateToMedia = (id: string) => {
    router.push(`/${selectedService}/${id}`);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex">
        <div className="relative flex w-full">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value as MediaType)}
            className="absolute inset-y-0 left-0 w-24 pl-2 pr-7 border-r border-gray-300 bg-gray-50 text-gray-600 text-sm rounded-l-md focus:outline-none focus:ring-0"
          >
            {Object.keys(serviceMap).map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className="w-full rounded-md border border-gray-300 pl-28 pr-10 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Search..."
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            ) : (
              <Search className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </form>

      {isFocused && query && (
        <SearchSuggestions
          query={query}
          selectedService={selectedService}
          onSelect={handleNavigateToMedia}
        />
      )}
    </div>
  );
}