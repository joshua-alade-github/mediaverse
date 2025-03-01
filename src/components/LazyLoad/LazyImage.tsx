'use client';

import { useState, useEffect, useRef } from 'react';
import { OptimizedImage } from '../OptimizedImage';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function LazyImage(props: LazyImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={props.className}>
      {isVisible ? (
        <OptimizedImage {...props} />
      ) : (
        <div 
          className="bg-gray-200 animate-pulse"
          style={{ 
            width: props.width,
            height: props.height,
            aspectRatio: props.width && props.height ? props.width / props.height : undefined
          }}
        />
      )}
    </div>
  );
}