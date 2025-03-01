'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function PageLoadMetrics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const reportWebVitals = () => {
      if (window.performance) {
        const metrics = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = window.performance.getEntriesByType('paint');
        const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime;

        // Report metrics to analytics
        const analyticsData = {
          url: pathname + searchParams.toString(),
          timeToFirstByte: metrics.responseStart,
          firstContentfulPaint: fcp,
          domInteractive: metrics.domInteractive,
          domComplete: metrics.domComplete,
          loadEvent: metrics.loadEventEnd,
        };

        // Send to analytics service
        fetch('/api/analytics/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analyticsData),
        });
      }
    };

    // Report metrics when the page loads
    window.addEventListener('load', reportWebVitals);

    return () => {
      window.removeEventListener('load', reportWebVitals);
    };
  }, [pathname, searchParams]);

  return null;
}