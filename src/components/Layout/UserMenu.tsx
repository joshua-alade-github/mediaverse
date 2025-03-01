'use client';

import { useState } from 'react';
import { supabase } from '@/lib/client/supabase';
import { User } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronDown, 
  Settings, 
  LogOut, 
  User as UserIcon,
  Bookmark,
  Heart
} from 'lucide-react';

export function UserMenu({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="relative ml-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
      >
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium">
              {user.username[0].toUpperCase()}
            </span>
          )}
        </div>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <Link
            href={`/profile/${user.username}`}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <UserIcon className="h-4 w-4 mr-2" />
            Profile
          </Link>
          
          <Link
            href="/lists"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <Bookmark className="h-4 w-4 mr-2" />
            My Lists
          </Link>

          <Link
            href="/favorites"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <Heart className="h-4 w-4 mr-2" />
            Favorites
          </Link>

          <Link
            href="/settings"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}