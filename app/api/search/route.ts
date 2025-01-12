import { NextResponse } from 'next/server';
import { searchVideos } from '@/lib/youtube';
import type { YouTubeVideo } from '@/types/youtube';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const sort = searchParams.get('sort') as 'relevance' | 'date' | 'views' || 'relevance';
    const duration = searchParams.get('duration') as 'any' | 'short' | 'medium' | 'long' || 'any';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const { data } = await searchVideos(query, { sort, duration });

    // Log raw data for debugging
    console.log('Raw video data:', JSON.stringify(data[0], null, 2));

    // Map the API response to our video type
    const videos: YouTubeVideo[] = data.map(video => ({
      id: video.videoId,
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnail.url,
      channelTitle: video.channelTitle,
      publishedAt: video.uploadDate || video.publishedAt || 'Unknown date',
      viewCount: video.viewCount,
      duration: video.lengthText || video.duration || '0:00'
    }));

    return NextResponse.json({ videos });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search videos' },
      { status: 500 }
    );
  }
} 