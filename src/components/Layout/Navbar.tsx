'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SearchBar } from '../Search/SearchBar';
import { mediaTypeTitles } from '@/utils/media';
import { Sliders, Menu, X } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left section - Logo and Desktop Navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-xl font-bold text-indigo-600">Mediaverse</span>
            </Link>
          </div>
          
          {/* Center section - Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {Object.entries(mediaTypeTitles).map(([type, title]) => (
              <Link
                key={type}
                href={`/${type}`}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === `/${type}`
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {title}
              </Link>
            ))}
          </div>

          {/* Right section - Search */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="w-96">
              <SearchBar />
            </div>

            <Link
              href="/search"
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
              title="Advanced Search"
            >
              <Sliders className="w-5 h-5" />
            </Link>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          {Object.entries(mediaTypeTitles).map(([type, title]) => (
            <Link
              key={type}
              href={`/${type}`}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                pathname === `/${type}`
                  ? 'border-indigo-500 text-indigo-700 bg-indigo-50'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {title}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}