'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/client/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Switch } from '@headlessui/react';

interface NotificationPreferences {
  email: {
    newFollower: boolean;
    listActivity: boolean;
    mentions: boolean;
    reviews: boolean;
    comments: boolean;
    newsletter: boolean;
  };
  push: {
    newFollower: boolean;
    listActivity: boolean;
    mentions: boolean;
    reviews: boolean;
    comments: boolean;
  };
}

export function NotificationSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      newFollower: true,
      listActivity: true,
      mentions: true,
      reviews: true,
      comments: true,
      newsletter: true,
    },
    push: {
      newFollower: true,
      listActivity: true,
      mentions: true,
      reviews: true,
      comments: true,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPreferences(data.preferences);
      }
    };

    loadPreferences();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          preferences,
        });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const NotificationToggle = ({ 
    type,
    setting,
    label 
  }: { 
    type: 'email' | 'push';
    setting: keyof NotificationPreferences['email'] | keyof NotificationPreferences['push'];
    label: string;
  }) => (
    <Switch.Group>
      <div className="flex items-center justify-between py-4">
        <Switch.Label className="text-sm font-medium text-gray-700">
          {label}
        </Switch.Label>
        <Switch
          checked={preferences[type][setting]}
          onChange={(checked) => setPreferences({
            ...preferences,
            [type]: {
              ...preferences[type],
              [setting]: checked,
            }
          })}
          className={`${
            preferences[type][setting] ? 'bg-indigo-600' : 'bg-gray-200'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
        >
          <span
            className={`${
              preferences[type][setting] ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>
    </Switch.Group>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white shadow rounded-lg divide-y">
        <div className="p-6">
          <h2 className="text-xl font-medium text-gray-900">Email Notifications</h2>
          <div className="mt-4">
            <NotificationToggle type="email" setting="newFollower" label="New followers" />
            <NotificationToggle type="email" setting="listActivity" label="List activity" />
            <NotificationToggle type="email" setting="mentions" label="Mentions" />
            <NotificationToggle type="email" setting="reviews" label="Reviews on your content" />
            <NotificationToggle type="email" setting="comments" label="Comments on your posts" />
            <NotificationToggle type="email" setting="newsletter" label="Weekly newsletter" />
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-medium text-gray-900">Push Notifications</h2>
          <div className="mt-4">
            <NotificationToggle type="push" setting="newFollower" label="New followers" />
            <NotificationToggle type="push" setting="listActivity" label="List activity" />
            <NotificationToggle type="push" setting="mentions" label="Mentions" />
            <NotificationToggle type="push" setting="reviews" label="Reviews on your content" />
            <NotificationToggle type="push" setting="comments" label="Comments on your posts" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className={`
            px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
            ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
          `}
        >
          {isLoading ? 'Saving...' : 'Save Notification Settings'}
        </button>
      </div>

      {isSaved && (
        <div className="fixed bottom-4 right-4 bg-green-50 text-green-800 px-4 py-2 rounded-md shadow-sm">
          Notification settings saved successfully!
        </div>
      )}
    </form>
  );
}