'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Media, MediaReference } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/client/supabase';
import { useMediaImport } from '@/hooks/useMediaImport';

interface QuickAddMenuProps {
  media: Media | MediaReference;
  onClose: () => void;
}

// Type guard
function isMediaReference(media: Media | MediaReference): media is MediaReference {
  return 'attribution' in media;
}

export function QuickAddMenu({ media, onClose }: QuickAddMenuProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { importMedia, isImporting } = useMediaImport();

  const handleAddToList = async (listId: string) => {
    setIsLoading(true);
    try {
      let mediaId = media.id;

      // If it's external media, import it first
      if (isMediaReference(media)) {
        const importedMedia = await importMedia(media);
        mediaId = importedMedia.id;
      }

      await supabase
        .from('list_items')
        .insert({
          list_id: listId,
          media_id: mediaId,
        });
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
      <div className="py-1" role="menu">
        <button
          onClick={() => handleAddToList('watchlist')}
          disabled={isLoading || isImporting}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          {isImporting ? 'Importing...' : 'Add to Watchlist'}
        </button>
        <button
          onClick={() => handleAddToList('favorites')}
          disabled={isLoading || isImporting}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          {isImporting ? 'Importing...' : 'Add to Favorites'}
        </button>
        <Link
          href={`/lists/create?mediaId=${isMediaReference(media) ? media.externalId : media.id}&source=${isMediaReference(media) ? media.externalSource : 'local'}`}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          onClick={onClose}
        >
          Add to New List...
        </Link>
      </div>
    </div>
  );
}