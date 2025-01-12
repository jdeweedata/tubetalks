export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
  lengthSeconds?: string;
}

export interface YouTubeSearchResponse {
  videos: YouTubeVideo[];
  next_page_token: string | null;
  error?: string;
} 