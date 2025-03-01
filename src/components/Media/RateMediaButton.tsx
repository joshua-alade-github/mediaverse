'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/lib/client/supabase';
import { useAuth } from '@/hooks/useAuth';

interface RateMediaButtonProps {
  mediaId: string;
  currentUserRating: number | null;
}

export function RateMediaButton({ mediaId, currentUserRating }: RateMediaButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(currentUserRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { user } = useAuth();

  const handleRate = async (value: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('reviews')
      .upsert({
        media_id: mediaId,
        user_id: user.id,
        rating: value,
      });

    if (!error) {
      setRating(value);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
      >
        <Star className="h-5 w-5" />
        <span>{rating ? `Rated ${rating}` : 'Rate'}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 p-4 bg-white rounded-lg shadow-lg">
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <button
                key={value}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => handleRate(value)}
                className={`p-1 ${
                  value <= (hoveredRating || rating || 0)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              >
                <Star className="h-6 w-6 fill-current" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}