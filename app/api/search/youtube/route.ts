import { NextResponse } from 'next/server';
import type { YouTubeVideo } from '@/types/youtube';

// Function to extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const apiKey = process.env.SERP_API_KEY;
    
    // Check if the query is a YouTube URL
    const videoId = extractVideoId(query);
    let apiUrl: string;
    
    if (videoId) {
      // If it's a video URL, use the video ID for direct search
      apiUrl = `https://serpapi.com/search.json?engine=youtube&search_query=https://youtube.com/watch?v=${videoId}&api_key=${apiKey}`;
    } else {
      // Regular search query
      apiUrl = `https://serpapi.com/search.json?engine=youtube&search_query=${encodeURIComponent(query)}&api_key=${apiKey}`;
    }

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