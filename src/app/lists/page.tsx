import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Use dynamic import with SSR disabled to prevent hydration mismatches
const ListsClient = dynamic(() => import('./lists-client').then(mod => mod.ListsClient), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-96">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  )
});

export default function ListsPage() {
  return (
    <Suspense>
      <ListsClient />
    </Suspense>
  );
}