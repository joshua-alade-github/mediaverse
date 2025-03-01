import { NextRequest } from 'next/server';
import { StatisticsTracker } from '@/lib/statistics/tracker';

declare module 'next/server' {
  interface NextRequest {
    auth?: { id: string };
    statistics?: StatisticsTracker;
    statisticsEvents?: { type: string; metadata: Record<string, any> }[];
    activityEvents?: { type: string; content: string; metadata: Record<string, any> }[];
  }
}