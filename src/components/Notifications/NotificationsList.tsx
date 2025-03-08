'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/client/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Bell, UserPlus, Heart, MessageSquare, Star, Bookmark, CheckCheck } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  content: string;
  related_id?: string;
  read: boolean;
  created_at: string;
  sender?: {
    username: string;
    avatar_url?: string;
  };
}

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select(`
            *,
            sender:related_id(username, avatar_url)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
          
        if (error) throw error;
        
        setNotifications(data || []);
      } catch (err: any) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  const markAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="h-5 w-5 text-indigo-500" />;
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'review':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'list_add':
        return <Bookmark className="h-5 w-5 text-green-500" />;
      case 'media_complete':
        return <CheckCheck className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getNotificationLink = (notification: Notification) => {
    const { type, related_id } = notification;
    
    switch (type) {
      case 'follow':
        return `/profile/${related_id}`;
      case 'like':
      case 'comment':
        return `/posts/${related_id}`;
      case 'review':
        return `/reviews/${related_id}`;
      case 'list_add':
        return `/lists/${related_id}`;
      case 'media_complete':
        return `/media/${related_id}`;
      default:
        return '#';
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse text-gray-500">Loading notifications...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }
  
  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-2 text-base font-medium text-gray-900">No notifications</h3>
        <p className="mt-1 text-sm text-gray-500">You don't have any notifications yet.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <div className="border-b border-gray-200 p-4 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
        <button
          onClick={markAllAsRead}
          className="text-sm text-indigo-600 hover:text-indigo-900"
        >
          Mark all as read
        </button>
      </div>
      <ul className="divide-y divide-gray-200">
        {notifications.map((notification) => (
          <li 
            key={notification.id} 
            className={`p-4 hover:bg-gray-50 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
          >
            <Link
              href={getNotificationLink(notification)}
              onClick={() => !notification.read && markAsRead(notification.id)}
              className="flex items-start space-x-3"
            >
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900">
                  {notification.content}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}