'use client';

import Link from 'next/link';
import { Film, Gamepad2, BookOpen, Music } from 'lucide-react';
import type { MediaType } from '@/types';

interface MediaTypeItem {
  type: MediaType;
  label: string;
  icon: React.ReactNode;
  description: string;
  gradient: string;
}

const mediaTypes: MediaTypeItem[] = [
  {
    type: 'movie',
    label: 'Movies',
    icon: <Film className="w-8 h-8" />,
    description: 'Discover your favorite films',
    gradient: 'from-rose-500 to-orange-500'
  },
  {
    type: 'game',
    label: 'Games',
    icon: <Gamepad2 className="w-8 h-8" />,
    description: 'Discover your favorite games',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    type: 'book',
    label: 'Books',
    icon: <BookOpen className="w-8 h-8" />,
    description: 'Discover your favorite books',
    gradient: 'from-amber-500 to-yellow-500'
  },
  {
    type: 'music',
    label: 'Music',
    icon: <Music className="w-8 h-8" />,
    description: 'Discover your favorite music',
    gradient: 'from-purple-500 to-pink-500'
  }
];

export function MediaTypeGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {mediaTypes.map(({ type, label, icon, description, gradient }) => (
        <Link
          key={type}
          href={`/${type}`}
          className="group relative overflow-hidden rounded-lg"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-75 group-hover:opacity-90 transition-opacity`} />
          
          <div className="relative p-6 flex flex-col h-full">
            <div className="text-white mb-4">
              {icon}
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
              {label}
            </h3>
            
            <p className="text-white/90 text-sm">
              {description}
            </p>
            
            <div className="mt-4 flex items-center text-white/90 text-sm font-medium group-hover:translate-x-2 transition-transform">
              Explore
              <svg 
                className="ml-2 w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}