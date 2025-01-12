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
    if (!apiKey) {
      throw new Error('SERP_API_KEY is not configured');
    }

    // Check if the query is a YouTube URL
    const videoId = extractVideoId(query);
    let apiUrl: string;
    
    if (videoId) {
      // For direct video URLs, use a more specific search approach
      apiUrl = `https://serpapi.com/search.json?engine=youtube&search_query=${videoId}&api_key=${apiKey}&type=video`;
    } else {
      // Regular search query
      apiUrl = `https://serpapi.com/search.json?engine=youtube&search_query=${encodeURIComponent(query)}&api_key=${apiKey}`;
    }

    console.log('Fetching from URL:', apiUrl.replace(apiKey, 'HIDDEN')); // Safe logging

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    if (!data.video_results || data.video_results.length === 0) {
      if (videoId) {
        // If it's a video ID search and no results, try searching with the full URL
        const fallbackUrl = `https://serpapi.com/search.json?engine=youtube&search_query=${encodeURIComponent(query)}&api_key=${apiKey}`;
        const fallbackResponse = await fetch(fallbackUrl);
        const fallbackData = await fallbackResponse.json();
        
        if (!fallbackData.video_results) {
          throw new Error('No video results found');
        }
        data.video_results = fallbackData.video_results;
      } else {
        throw new Error('No video results found');
      }
    }

    const videos: YouTubeVideo[] = data.video_results.map((video: any) => ({
      id: video.link.split('v=')[1] || videoId, // Fallback to extracted videoId
      title: video.title,
      description: video.description || '',
      thumbnailUrl: video.thumbnail?.static || video.thumbnail?.url || '',
      publishedAt: video.published_date || new Date().toISOString(),
      channelTitle: video.channel?.name || 'Unknown Channel',
      viewCount: video.views?.toString() || '0',
      likeCount: '0', // SerpAPI doesn't provide like count
      duration: video.duration || '0:00'
    }));

    return NextResponse.json({
      videos,
      next_page_token: data.serpapi_pagination?.next_page_token || null
    });
  } catch (error) {
    console.error('Error fetching YouTube data:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch YouTube data',
      query,
      isUrl: !!extractVideoId(query)
    }, { status: 500 });
  }
} 