import { headers } from 'next/headers';
import VideoCard from '@/components/video/VideoCard';
import { YouTubeVideo } from '@/types/youtube';

interface SearchResultsProps {
  query: string;
  sort?: string;
  duration?: string;
}

const getMinutes = (duration: string): number => {
  const [min, sec] = duration.split(':').map(Number);
  return min + (sec || 0) / 60;
};

function filterAndSortVideos(videos: YouTubeVideo[], sort?: string, duration?: string) {
  let filteredVideos = [...videos];

  // Apply duration filter
  if (duration && duration !== 'any') {
    filteredVideos = filteredVideos.filter(video => {
      const minutes = getMinutes(video.duration);
      switch (duration) {
        case 'short':
          return minutes < 4;
        case 'medium':
          return minutes >= 4 && minutes <= 20;
        case 'long':
          return minutes > 20;
        default:
          return true;
      }
    });
  }

  // Apply sorting
  if (sort) {
    filteredVideos.sort((a, b) => {
      switch (sort) {
        case 'date':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'views':
          return parseInt(b.viewCount) - parseInt(a.viewCount);
        case 'duration':
          return getMinutes(b.duration) - getMinutes(a.duration);
        default:
          return 0;
      }
    });
  }

  return filteredVideos;
}

export default async function SearchResults({ query, sort, duration }: SearchResultsProps) {
  try {
    const host = headers().get('host') || 'localhost:3000';
    const protocol = process?.env?.NODE_ENV === 'development' ? 'http' : 'https';
    
    const res = await fetch(`${protocol}://${host}/api/search/youtube?q=${encodeURIComponent(query)}`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Search API error:', {
        status: res.status,
        statusText: res.statusText,
        data: errorData
      });
      return (
        <div className="text-center p-4 rounded-lg bg-red-50 text-red-600">
          <p>Sorry, we couldn't fetch the search results at this time.</p>
          <p className="text-sm mt-2">Please try again later or check your API configuration.</p>
        </div>
      );
    }
    
    const data = await res.json();
    const videos = data?.videos || [];
    
    if (!videos || videos.length === 0) {
      return (
        <div className="text-center p-4">
          No results found for "{query}"
        </div>
      );
    }

    const filteredAndSortedVideos = filterAndSortVideos(videos, sort, duration);

    if (filteredAndSortedVideos.length === 0) {
      return (
        <div className="text-center p-4">
          No videos match the selected filters
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedVideos.map((video: YouTubeVideo) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    );
  } catch (error) {
    console.error('SearchResults error:', error);
    return (
      <div className="text-center p-4 rounded-lg bg-red-50 text-red-600">
        <p>An unexpected error occurred while fetching search results.</p>
        <p className="text-sm mt-2">Please try again later.</p>
      </div>
    );
  }
} 