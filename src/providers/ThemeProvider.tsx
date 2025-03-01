'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/client/supabase';
import { useAuth } from '@/hooks/useAuth';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const { user } = useAuth();

  useEffect(() => {
    // Load theme preference from local storage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Load theme preference from user settings if logged in
    if (user) {
      supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.preferences?.theme) {
            setTheme(data.preferences.theme);
          }
        });
    }
  }, [user]);

  useEffect(() => {
    // Update local storage when theme changes
    localStorage.setItem('theme', theme);

    // Update document class for dark mode
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
