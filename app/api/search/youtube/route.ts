import { NextResponse } from 'next/server';
import type { YouTubeVideo } from '@/types/youtube';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const apiKey = process.env.SERP_API_KEY;
    const apiUrl = `https://serpapi.com/search.json?engine=youtube&search_query=${encodeURIComponent(query)}&api_key=${apiKey}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.video_results) {
      throw new Error('No video results found');
    }

    const videos: YouTubeVideo[] = data.video_results.map((video: any) => ({
      id: video.link.split('v=')[1],
      title: video.title,
      description: video.description || '',
      thumbnailUrl: video.thumbnail.static,
      publishedAt: video.published_date,
      channelTitle: video.channel.name,
      viewCount: video.views?.toString() || '0',
      likeCount: '0', // SerpAPI doesn't provide like count
      duration: video.duration || ''
    }));

    return NextResponse.json({
      videos,
      next_page_token: data.serpapi_pagination?.next_page_token || null
    });
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    return NextResponse.json({ error: 'Failed to fetch YouTube data' }, { status: 500 });
  }
} 