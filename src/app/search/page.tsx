import { Suspense } from 'react';
import { AdvancedSearch } from '@/components/Search/AdvancedSearch';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface SearchPageProps {
  searchParams: {
    q?: string;
    type?: string;
    genre?: string;
    sort?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">
          {searchParams.q 
            ? `Search results for "${searchParams.q}"`
            : 'Advanced Search'
          }
        </h1>

        <Suspense fallback={<LoadingSpinner />}>
          <AdvancedSearch 
            initialQuery={searchParams.q}
            initialType={searchParams.type}
            initialGenre={searchParams.genre}
            initialSort={searchParams.sort}
          />
        </Suspense>
      </div>
    </div>
  );
}