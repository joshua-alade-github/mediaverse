import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { MediaType } from '@/types';
import { serviceMap } from '@/lib/services/media';
import { TrendingSection } from '@/components/Media/TrendingSection';
import { NewsGrid } from '@/components/News/NewsGrid';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface SectionHeaderProps {
  title: string;
  href: string;
}

const SectionHeader = ({ title, href }: SectionHeaderProps) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-semibold">{title}</h2>
    <Link 
      href={href}
      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
    >
      More
      <ArrowRight className="ml-1 w-4 h-4" />
    </Link>
  </div>
);

interface MediaTypePageProps {
  params: { mediaType: string };
}

export default function MediaTypePage({
  params: { mediaType },
}: MediaTypePageProps) {
  // Validate media type using the serviceMap
  if (!(mediaType in serviceMap)) {
    notFound();
  }

  const validatedMediaType = mediaType as MediaType;
  const formattedType = mediaType.replace('_', ' ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold capitalize">
          {formattedType}
        </h1>
      </div>

      {/* Trending Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <SectionHeader 
          title="Trending Now"
          href={`/${mediaType}/trending`}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <TrendingSection mediaType={validatedMediaType} />
        </Suspense>
      </section>

      {/* Recent News */}
      <section className="bg-white rounded-lg shadow p-6">
        <SectionHeader 
          title={`Latest ${formattedType} News`}
          href={`/${mediaType}/news`}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <NewsGrid mediaType={validatedMediaType} limit={6} />
        </Suspense>
      </section>
    </div>
  );
}