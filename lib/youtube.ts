import { fetchFromAPI } from '@/utils/api';

export interface VideoInfo {
  id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnail: {
    url: string;
  };
  channelTitle: string;
  publishedAt?: string;
  uploadDate?: string;
  publishDate?: string;
  viewCount: string;
  duration?: string;
  lengthSeconds?: string;
  lengthText?: string;
}

export interface SearchResponse {
  data: VideoInfo[];
  continuation: string | null;
}

export async function getVideoInfo(videoId: string): Promise<VideoInfo> {
  const data = await fetchFromAPI<VideoInfo>('/video/info', { id: videoId });
  return {
    ...data,
    publishedAt: data.publishedAt || new Date().toISOString()
  };
}

export async function searchVideos(query: string, options: {
  sort?: 'relevance' | 'date' | 'views';
  duration?: 'any' | 'short' | 'medium' | 'long';
} = {}): Promise<SearchResponse> {
  const params: Record<string, string> = {
    query,
    type: 'video',
    ...options,
  };

  // If sort is 'date', add the appropriate parameter for RapidAPI
  if (options.sort === 'date') {
    params.sort_by = 'upload_date';
    params.order = 'desc'; // descending order (newest first)
  }

  const response = await fetchFromAPI<any>('/search', params);

  // Extract the correct date field from the response
  const processedData = {
    ...response,
    data: response.data.map((video: any) => ({
      ...video,
      publishedAt: video.uploadDate || video.publishDate || video.publishedAt || new Date().toISOString()
    }))
  };

  // If sort is 'date' and the API didn't sort properly, sort locally
  if (options.sort === 'date') {
    processedData.data.sort((a: VideoInfo, b: VideoInfo) => {
      const dateA = new Date(a.publishedAt || '').getTime();
      const dateB = new Date(b.publishedAt || '').getTime();
      return dateB - dateA; // descending order (newest first)
    });
  }

  return processedData;
}
