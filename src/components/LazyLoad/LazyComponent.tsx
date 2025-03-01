'use client';

import { useState, useEffect, useRef } from 'react';
import { LoadingSpinner } from '../LoadingSpinner';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
}

export function LazyComponent({ 
  children, 
  fallback = <LoadingSpinner />,
  threshold = 0.1 
}: LazyComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={componentRef}>
      {isVisible ? children : fallback}
    </div>
  );
}