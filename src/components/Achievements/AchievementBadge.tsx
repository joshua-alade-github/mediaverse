'use client';

import { useState } from 'react';
import { Award, Trophy, Check, Calendar, Hash, Film, Book, Gamepad2, Music } from 'lucide-react';

interface AchievementBadgeProps {
  id: string;
  title: string;
  description: string;
  type: 'count' | 'streak' | 'special' | 'media';
  progress: number;
  target: number;
  unlockedAt?: string;
  level?: number;
}

export function AchievementBadge({
  id,
  title,
  description,
  type,
  progress,
  target,
  unlockedAt,
  level = 1,
}: AchievementBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const isUnlocked = progress >= target;
  const progressPercent = Math.min((progress / target) * 100, 100);
  
  const getBadgeIcon = () => {
    switch (type) {
      case 'count':
        return <Hash className="h-6 w-6" />;
      case 'streak':
        return <Calendar className="h-6 w-6" />;
      case 'media':
        // Different icons based on achievement ID
        if (id.includes('movie')) return <Film className="h-6 w-6" />;
        if (id.includes('book')) return <Book className="h-6 w-6" />;
        if (id.includes('game')) return <Gamepad2 className="h-6 w-6" />;
        if (id.includes('music')) return <Music className="h-6 w-6" />;
        return <Trophy className="h-6 w-6" />;
      case 'special':
      default:
        return <Award className="h-6 w-6" />;
    }
  };
  
  const getBadgeColor = () => {
    if (!isUnlocked) return 'text-gray-400 bg-gray-100';
    
    // Different colors based on level
    switch (level) {
      case 3:
        return 'text-amber-600 bg-amber-100';
      case 2:
        return 'text-slate-600 bg-slate-100';
      case 1:
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };
  
  return (
    <div 
      className={`rounded-lg p-4 border ${isUnlocked ? 'border-green-200' : 'border-gray-200'} relative cursor-pointer transition-all hover:shadow-md`}
      onClick={() => setShowDetails(!showDetails)}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${getBadgeColor()}`}>
          {getBadgeIcon()}
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium">
            {title} {level > 1 && <span className="text-sm text-gray-500">Lvl {level}</span>}
          </h3>
          
          {showDetails && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
          
          {!isUnlocked ? (
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {progress} / {target}
              </p>
            </div>
          ) : (
            <p className="text-xs text-green-600 flex items-center mt-1">
              <Check className="h-3 w-3 mr-1" />
              {unlockedAt ? `Earned on ${new Date(unlockedAt).toLocaleDateString()}` : 'Completed'}
            </p>
          )}
        </div>
      </div>
      
      {isUnlocked && (
        <div className="absolute -top-2 -right-2 p-1 bg-green-500 rounded-full text-white">
          <Check className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}