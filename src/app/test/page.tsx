'use client';

import { useState } from 'react';
import {
  TMDBService,
  RAWGService,
  GoogleBooksService,
  LastFMService,
  ComicVineService,
  searchAllServices
} from '@/lib/services/media';

// Initialize services
const tmdb = new TMDBService();
const rawg = new RAWGService();
const googleBooks = new GoogleBooksService();
const lastfm = new LastFMService();
const comicVine = new ComicVineService();

interface TestResult {
  service: string;
  search?: any;
  trending?: any;
  popular?: any;
  details?: any;
  error?: string;
}

export default function APITestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('star wars');
  const [detailsId, setDetailsId] = useState('');

  const services = {
    tmdb: {
      name: 'TMDB (Movies & TV)',
      service: tmdb,
      detailsPlaceholder: 'tt0076759 (IMDB ID) or 11 (TMDB ID)'
    },
    rawg: {
      name: 'RAWG (Games)',
      service: rawg,
      detailsPlaceholder: 'grand-theft-auto-v'
    },
    googleBooks: {
      name: 'Google Books',
      service: googleBooks,
      detailsPlaceholder: 'tPwkAAAAQBAJ'
    },
    lastfm: {
      name: 'Last.fm (Music)',
      service: lastfm,
      detailsPlaceholder: '5c176592-e87c-4f3c-ab41-159ad9537be0 (MBID) or name|||artist'
    },
    comicVine: {
      name: 'Comic Vine',
      service: comicVine,
      detailsPlaceholder: '4050-14582'
    }
  };

  const testService = async (serviceName: string, service: any) => {
    const result: TestResult = { service: serviceName };
    
    try {
      // Test search
      result.search = await service.searchMedia(searchQuery);
      
      // Test trending if available
      if (service.getTrendingMedia) {
        result.trending = await service.getTrendingMedia();
      }
      
      // Test popular if available
      if (service.getPopularMedia) {
        result.popular = await service.getPopularMedia();
      }
      
      // Test details if ID provided
      if (detailsId) {
        // Special handling for Last.fm to specify type
        if (serviceName === 'lastfm') {
          result.details = await service.getMediaDetails(detailsId, 'album');
        } else {
          result.details = await service.getMediaDetails(detailsId);
        }
      }
    } catch (error) {
      result.error = error.message;
      console.error(`Error testing ${serviceName}:`, error);
    }
    
    return result;
  };

  const testAllServices = async () => {
    setIsLoading(true);
    const allResults: TestResult[] = [];

    try {
      if (selectedService === 'all') {
        // Test search across all services
        const searchResults = await searchAllServices(searchQuery);
        allResults.push({
          service: 'All Services Search',
          search: searchResults
        });

        // Test individual services
        for (const [key, { service }] of Object.entries(services)) {
          const result = await testService(key, service);
          allResults.push(result);
        }
      } else {
        const { service } = services[selectedService];
        const result = await testService(selectedService, service);
        allResults.push(result);
      }
    } catch (error) {
      console.error('Test error:', error);
    }

    setResults(allResults);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">API Services Test</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Service to Test</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full max-w-md rounded-md border-gray-300"
          >
            <option value="all">All Services</option>
            {Object.entries(services).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Search Query</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md rounded-md border-gray-300"
            placeholder="Enter search query"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Details ID</label>
          <input
            type="text"
            value={detailsId}
            onChange={(e) => setDetailsId(e.target.value)}
            className="w-full max-w-md rounded-md border-gray-300"
            placeholder={selectedService !== 'all' ? services[selectedService].detailsPlaceholder : 'Select a service first'}
          />
        </div>

        <button
          onClick={testAllServices}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Testing...' : 'Run Tests'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-6">
          {results.map((result, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">{result.service}</h2>
              
              {result.error ? (
                <div className="bg-red-100 text-red-700 p-4 rounded">
                  Error: {result.error}
                </div>
              ) : (
                <div className="space-y-4">
                  {result.search && (
                    <div>
                      <h3 className="font-medium mb-2">Search Results</h3>
                      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                        {JSON.stringify(result.search, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {result.trending && (
                    <div>
                      <h3 className="font-medium mb-2">Trending</h3>
                      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                        {JSON.stringify(result.trending, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {result.popular && (
                    <div>
                      <h3 className="font-medium mb-2">Popular</h3>
                      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                        {JSON.stringify(result.popular, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {result.details && (
                    <div>
                      <h3 className="font-medium mb-2">Details</h3>
                      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}