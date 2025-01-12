import { Suspense } from 'react';
import SearchResults from '@/components/SearchResults';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import SearchFilters from '@/components/search/SearchFilters';

interface SearchPageProps {
  searchParams: { 
    q: string;
    sort?: string;
    duration?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const { q: query, sort, duration } = searchParams;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Search Results for: {decodeURIComponent(query)}
      </h1>
      
      <SearchFilters />
      
      <Suspense fallback={<LoadingSpinner />}>
        {/* @ts-expect-error Async Server Component */}
        <SearchResults query={query} sort={sort} duration={duration} />
      </Suspense>
    </div>
  );
} 