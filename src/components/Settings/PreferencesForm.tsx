'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/client/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Switch } from '@headlessui/react';

interface Preferences {
  theme: 'light' | 'dark' | 'system';
  contentLanguages: string[];
  showNsfw: boolean;
  autoplayVideos: boolean;
  defaultListPrivacy: 'public' | 'private';
  defaultSortOrder: 'recent' | 'rating' | 'title';
}

export function PreferencesForm() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Preferences>({
    theme: 'system',
    contentLanguages: ['en'],
    showNsfw: false,
    autoplayVideos: true,
    defaultListPrivacy: 'public',
    defaultSortOrder: 'recent',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('user_preferences')
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
        .from('user_preferences')
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-medium text-gray-900">Display Settings</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Theme
            </label>
            <select
              value={preferences.theme}
              onChange={(e) => setPreferences({
                ...preferences,
                theme: e.target.value as Preferences['theme']
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Content Languages
            </label>
            <div className="mt-2 space-y-2">
              {['en', 'es', 'fr', 'de', 'ja'].map((lang) => (
                <label key={lang} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.contentLanguages.includes(lang)}
                    onChange={(e) => {
                      const newLangs = e.target.checked
                        ? [...preferences.contentLanguages, lang]
                        : preferences.contentLanguages.filter((l) => l !== lang);
                      setPreferences({
                        ...preferences,
                        contentLanguages: newLangs,
                      });
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {new Intl.DisplayNames(['en'], { type: 'language' }).of(lang)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Switch.Group>
            <div className="flex items-center justify-between">
              <Switch.Label className="text-sm font-medium text-gray-700">
                Autoplay Videos
              </Switch.Label>
              <Switch
                checked={preferences.autoplayVideos}
                onChange={(checked) => setPreferences({
                  ...preferences,
                  autoplayVideos: checked,
                })}
                className={`${
                  preferences.autoplayVideos ? 'bg-indigo-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`${
                    preferences.autoplayVideos ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          </Switch.Group>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-medium text-gray-900">Content Preferences</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Default List Privacy
            </label>
            <select
              value={preferences.defaultListPrivacy}
              onChange={(e) => setPreferences({
                ...preferences,
                defaultListPrivacy: e.target.value as 'public' | 'private'
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Default Sort Order
            </label>
            <select
              value={preferences.defaultSortOrder}
              onChange={(e) => setPreferences({
                ...preferences,
                defaultSortOrder: e.target.value as 'recent' | 'rating' | 'title'
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="recent">Recently Added</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          <Switch.Group>
            <div className="flex items-center justify-between">
              <Switch.Label className="text-sm font-medium text-gray-700">
                Show NSFW Content
              </Switch.Label>
              <Switch
                checked={preferences.showNsfw}
                onChange={(checked) => setPreferences({
                  ...preferences,
                  showNsfw: checked,
                })}
                className={`${
                  preferences.showNsfw ? 'bg-indigo-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`${
                    preferences.showNsfw ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          </Switch.Group>
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
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {isSaved && (
        <div className="fixed bottom-4 right-4 bg-green-50 text-green-800 px-4 py-2 rounded-md shadow-sm">
          Preferences saved successfully!
        </div>
      )}
    </form>
  );
}