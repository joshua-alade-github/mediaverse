'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
    { name: 'Account', href: '/settings' },
    { name: 'Preferences', href: '/settings/preferences' },
    { name: 'Notifications', href: '/settings/notifications' },
    { name: 'Privacy', href: '/settings/privacy' },
    { name: 'Security', href: '/settings/security' },
    { name: 'Connected Accounts', href: '/settings/connections' },
  ];
  
  export function SettingsNav() {
    const pathname = usePathname();
  
    return (
      <nav className="space-y-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                block px-3 py-2 rounded-md text-sm font-medium
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    );
  }