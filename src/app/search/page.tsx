import { Suspense } from 'react';
import SearchPageContent from '@/components/Search/SearchPageContent';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-screen bg-gray-50" />}>
      <SearchPageContent />
    </Suspense>
  );
}