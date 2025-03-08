'use client';

import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const DashboardClient = dynamic(
  () => import('./dashboard-client').then((mod) => mod.DashboardClient),
  {
    loading: () => (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    ),
  }
);

export function DashboardClientWrapper() {
  return <DashboardClient />;
}
