'use client';

import { ReactNode } from 'react';
import { QueryProvider } from '@/providers/QueryProvider';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  );
}