'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getServiceForType } from '@/lib/services/media';
import { useDebounce } from '@/hooks/useDebounce';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import type { MediaType } from '@/types';

interface SearchSuggestionsProps {
  query: string;
  selectedService: MediaType;
  onSelect: (id: string) => void;
}

export function SearchSuggestions({
  query,
  selectedService,
  onSelect
}: SearchSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useOnClickOutside(wrapperRef, () => setIsOpen(false));

  // Get suggestions from the selected service
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['service-suggestions', debouncedQuery, selectedService],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      
      const service = getServiceForType(selectedService);
      const results = await service.searchMedia(debouncedQuery);
      console.log("service: " + service);
      console.log("results: " + results);
      
      
      return results.slice(0, 5).map(result => ({
        title: result.title,
        id: result.externalId,
        source: result.externalSource
      }));
    },
    enabled: Boolean(debouncedQuery && selectedService)
  });

  useEffect(() => {
    setIsOpen(Boolean(debouncedQuery && suggestions?.length));
  }, [debouncedQuery, suggestions]);

  if (!isOpen) return null;

  return (
    <div
      ref={wrapperRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-50"
    >
      {isLoading ? (
        <div className="p-4 text-gray-500">Loading suggestions...</div>
      ) : (
        <ul className="py-2">
          {suggestions?.map((suggestion, index) => (
            <li key={index}>
              <button
                onClick={() => {
                  onSelect(suggestion.id);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center group"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm group-hover:text-gray-600">🔍</span>
                  <span className="group-hover:text-indigo-600">{suggestion.title}</span>
                  <span className="text-xs text-blue-500 ml-2">
                    ({suggestion.source})
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}