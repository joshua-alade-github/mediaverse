'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Media, MediaReference } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/client/supabase';
import { useMediaImport } from '@/hooks/useMediaImport';
import { Loader2 } from 'lucide-react';

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
  const [buttonStates, setButtonStates] = useState({
    watchlist: { loading: false, error: null },
    favorites: { loading: false, error: null }
  });
  const [userLists, setUserLists] = useState<any[]>([]);
  const { importMedia, isImporting } = useMediaImport();

  // Fetch user's lists
  useEffect(() => {
    if (user) {
      const fetchLists = async () => {
        const { data } = await supabase
          .from('lists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        setUserLists(data || []);
      };
      
      fetchLists();
    }
  }, [user]);

  const handleAddToList = async (listId: string, listKey: 'watchlist' | 'favorites' | null = null) => {
    // Set loading state for the specific button
    if (listKey) {
      setButtonStates(prev => ({
        ...prev,
        [listKey]: { ...prev[listKey], loading: true, error: null }
      }));
    } else {
      setIsLoading(true); 
    }
    
    try {
      console.log(`Adding ${media.title} to list ${listId}`);
      
      let mediaId = media.id;
      let externalId = null;
      let externalSource = null;

      // If it's external media, import it first
      if (isMediaReference(media)) {
        console.log("Importing external media:", media);
        externalId = media.externalId;
        externalSource = media.externalSource;
        try {
          const importedMedia = await importMedia(media);
          mediaId = importedMedia.id;
          console.log("Media imported:", importedMedia);
        } catch (err) {
          console.error("Error importing media:", err);
          throw new Error("Failed to import media");
        }
      }

      // First check if this media already exists in the list
      const { data: existingItem } = await supabase
        .from('list_items')
        .select('id')
        .eq('list_id', listId)
        .eq('media_id', mediaId)
        .maybeSingle();
        
      if (existingItem) {
        console.log("Media already in list:", existingItem);
        return; // Already in list, do nothing
      }

      // Add to list
      const result = await supabase
        .from('list_items')
        .insert({
          list_id: listId,
          media_id: mediaId,
          external_id: externalId,
          external_source: externalSource,
          added_at: new Date().toISOString()
        });
        
      if (result.error) throw result.error;
      console.log("Added to list successfully");
      
    } catch (error) {
      console.error("Error adding to list:", error);
      if (listKey) {
        setButtonStates(prev => ({
          ...prev,
          [listKey]: { ...prev[listKey], error: error }
        }));
      }
    } finally {
      if (listKey) {
        setButtonStates(prev => ({
          ...prev,
          [listKey]: { ...prev[listKey], loading: false }
        }));
      } else {
        setIsLoading(false);
      }
      // Don't auto-close, give user feedback
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
      <div className="py-1" role="menu">
        <button
          onClick={() => handleAddToList('watchlist', 'watchlist')}
          disabled={buttonStates.watchlist.loading || isImporting}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 flex items-center"
        >
          {buttonStates.watchlist.loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Adding...
            </>
          ) : buttonStates.watchlist.error ? (
            'Failed to add'
          ) : (
            'Add to Watchlist'
          )}
        </button>
        
        <button
          onClick={() => handleAddToList('favorites', 'favorites')}
          disabled={buttonStates.favorites.loading || isImporting}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 flex items-center"
        >
          {buttonStates.favorites.loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Adding...
            </>
          ) : buttonStates.favorites.error ? (
            'Failed to add'
          ) : (
            'Add to Favorites'
          )}
        </button>

        {/* User's custom lists */}
        {userLists.length > 0 && (
          <div className="border-t border-gray-200 mt-1 pt-1">
            {userLists.map(list => (
              <button
                key={list.id}
                onClick={() => handleAddToList(list.id)}
                disabled={isLoading || isImporting}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                {isLoading ? 'Adding...' : `Add to "${list.title}"`}
              </button>
            ))}
          </div>
        )}
        
        <div className="border-t border-gray-200 mt-1 pt-1">
          <Link
            href={`/lists/create?mediaId=${isMediaReference(media) ? media.externalId : media.id}&source=${isMediaReference(media) ? media.externalSource : 'local'}`}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            Create New List...
          </Link>
        </div>
      </div>
    </div>
  );
}