'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/client/supabase';
import { useAuth } from '@/hooks/useAuth';

interface FavoriteButtonProps {
  mediaId: string;
  initialIsFavorite?: boolean;
}

export function FavoriteButton({ mediaId, initialIsFavorite = false }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Check favorite status on load
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)
          .eq('media_id', mediaId)
          .maybeSingle();

        if (error) throw error;
        setIsFavorite(!!data);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [user, mediaId]);

  const toggleFavorite = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('media_id', mediaId);

        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            media_id: mediaId,
            created_at: new Date().toISOString()
          });

        if (error) throw error;

        // Check if a "Favorites" list exists
        const { data: existingList, error: listError } = await supabase
          .from('lists')
          .select('*')
          .eq('user_id', user.id)
          .eq('title', 'Favorites')
          .maybeSingle();

        if (listError) throw listError;

        // Create Favorites list if it doesn't exist
        let listId = existingList?.id;
        if (!listId) {
          const { data: newList, error: createError } = await supabase
            .from('lists')
            .insert({
              user_id: user.id,
              title: 'Favorites',
              description: 'My favorite media',
              is_default: true,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) throw createError;
          listId = newList.id;
        }

        // Add media to favorites list
        const { error: itemError } = await supabase
          .from('list_items')
          .insert({
            list_id: listId,
            media_id: mediaId,
            added_at: new Date().toISOString()
          });

        if (itemError) throw itemError;
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Don't show for non-logged in users
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium ${
        isFavorite
          ? 'text-red-600 border border-red-200 bg-red-50 hover:bg-red-100'
          : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
      }`}
    >
      <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-600 text-red-600' : ''}`} />
      <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
    </button>
  );
}