'use client';

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useMediaImport } from '@/hooks/useMediaImport';
import type { MediaReference } from '@/types';

interface MediaImportButtonProps {
  media: MediaReference;
  variant?: 'icon' | 'button';
  onImported?: (mediaId: string) => void;
}

export function MediaImportButton({ 
  media, 
  variant = 'button',
  onImported 
}: MediaImportButtonProps) {
  const [isImporting, setIsImporting] = useState(false);
  const { importMedia } = useMediaImport();

  const handleImport = async () => {
    try {
      setIsImporting(true);
      const importedMedia = await importMedia(media);
      onImported?.(importedMedia.id);
    } catch (error) {
      console.error('Import failed:', error);
      // You might want to add toast notification here
    } finally {
      setIsImporting(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleImport}
        disabled={isImporting}
        className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100 disabled:opacity-50"
      >
        {isImporting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Plus className="h-5 w-5" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleImport}
      disabled={isImporting}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {isImporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Importing...
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          Add to Library
        </>
      )}
    </button>
  );
}