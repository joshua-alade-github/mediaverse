'use client';

import { useState } from 'react';
import { CheckCircle, Circle, CheckCheck, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/client/supabase';
import { useAuth } from '@/hooks/useAuth';
import { MediaType } from '@/types';

interface MediaCompleteButtonProps {
  mediaId: string;
  mediaType: MediaType;
  isCompleted?: boolean;
}

export function MediaCompleteButton({ 
  mediaId, 
  mediaType, 
  isCompleted = false 
}: MediaCompleteButtonProps) {
  const [completed, setCompleted] = useState(isCompleted);
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'not_started' | 'in_progress' | 'completed'>(
    isCompleted ? 'completed' : 'not_started'
  );
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return null; // Don't show the button for non-logged in users
  }

  const getStatusLabel = () => {
    switch (mediaType) {
      case 'movie':
      case 'tv_show':
        return {
          not_started: 'Not Watched',
          in_progress: 'Watching',
          completed: 'Watched'
        };
      case 'book':
        return {
          not_started: 'Not Read',
          in_progress: 'Reading',
          completed: 'Read'
        };
      case 'game':
        return {
          not_started: 'Not Played',
          in_progress: 'Playing',
          completed: 'Completed'
        };
      default:
        return {
          not_started: 'Not Started',
          in_progress: 'In Progress',
          completed: 'Completed'
        };
    }
  };

  const statusLabels = getStatusLabel();

  const updateStatus = async (newStatus: 'not_started' | 'in_progress' | 'completed') => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('media_progress')
        .upsert({
          media_id: mediaId,
          user_id: user.id,
          status: newStatus,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setStatus(newStatus);
      setCompleted(newStatus === 'completed');
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating media status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Icon based on current status
  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCheck className="mr-2 h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />;
      default:
        return <Circle className="mr-2 h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        disabled={isLoading}
      >
        {getIcon()}
        <span>
          {isLoading ? 'Updating...' : statusLabels[status]}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={() => updateStatus('not_started')}
              className="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              <Circle className={`mr-2 h-5 w-5 ${status === 'not_started' ? 'text-blue-500' : 'text-gray-400'}`} />
              {statusLabels.not_started}
            </button>
            <button
              onClick={() => updateStatus('in_progress')}
              className="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              <AlertCircle className={`mr-2 h-5 w-5 ${status === 'in_progress' ? 'text-yellow-500' : 'text-gray-400'}`} />
              {statusLabels.in_progress}
            </button>
            <button
              onClick={() => updateStatus('completed')}
              className="flex items-center w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              <CheckCheck className={`mr-2 h-5 w-5 ${status === 'completed' ? 'text-green-500' : 'text-gray-400'}`} />
              {statusLabels.completed}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}