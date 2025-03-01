'use client';

import * as Icons from 'lucide-react';

interface IconProps {
  name: keyof typeof Icons;
  className?: string;
  size?: number;
}

export function Icon({ name, className = '', size = 24 }: IconProps) {
  const IconComponent = Icons[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return <IconComponent className={className} size={size} />;
}