export const API_BASE_URL = 'https://yt-api.p.rapidapi.com';

export const getHeaders = () => {
  const apiKey = process.env.YT_API_KEY;
  const apiHost = process.env.YT_API_HOST;

  if (!apiKey || !apiHost) {
    throw new Error('YouTube API configuration is missing');
  }

  return {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': apiHost,
  };
};

export async function fetchFromAPI<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(error.message || `API request failed with status ${response.status}`);
  }

  return response.json();
} 