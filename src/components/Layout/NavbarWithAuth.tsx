'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from './Navbar';
import { Loader2 } from 'lucide-react';

export function NavbarWithAuth() {
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  
  // This prevents hydration mismatch by rendering only on the client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    // Return empty navbar skeleton during SSR
    return (
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-indigo-600">Mediaverse</span>
            </div>
            <div className="w-96 invisible md:visible"></div>
          </div>
        </div>
      </nav>
    );
  }
  
  if (loading) {
    return (
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-indigo-600">Mediaverse</span>
            </div>
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            </div>
          </div>
        </div>
      </nav>
    );
  }
  
  return <Navbar user={user} />;
}