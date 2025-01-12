'use client';

import React, { useEffect, useState } from 'react';
import { SearchHistory } from '../../components/SearchHistory';
import { searchYouTube } from '../../../lib/youtube';

interface VideoResult {
  position: number;
  title: string;
  link: string;
  thumbnail: {
    static: string;
    rich?: string;
  };
  channel: {
    name: string;
    link: string;
    verified?: boolean;
    thumbnail?: string;
  };
  views: number;
  published_date: string;
  length: string;
  description?: string;
  extensions?: string[];
}

interface ShortResult {
  title: string;
  link: string;
  thumbnail: string;
  views: number;
  views_original: string;
  video_id: string;
}

interface SearchPageProps {
  params: {
    query: string;
  };
}

interface YouTubeItem {
  id: {
    videoId: string;
  };
  // Add other properties you expect
}

interface YouTubeResponse {
  items: YouTubeItem[];
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { query } = params;
  const results = await searchYouTube(query);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Search Results for: {decodeURIComponent(query)}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.video_results.map((video: VideoResult) => (
          <div key={video.position} className="border p-4 rounded-lg">
            <img src={video.thumbnail.static} alt={video.title} className="w-full h-auto mb-2" />
            <h2 className="font-semibold">{video.title}</h2>
            <div className="flex items-center gap-2">
              <img src={video.channel.thumbnail} alt={video.channel.name} className="w-6 h-6 rounded-full" />
              <p className="text-sm text-gray-600">
                {video.channel.name} {video.channel.verified && '✓'}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              {video.views.toLocaleString()} views • {video.published_date} • {video.length}
            </p>
          </div>
        ))}
      </div>

      {results.shorts_results[0]?.shorts.map((short: ShortResult) => (
        <div key={short.video_id} className="border p-4 rounded-lg">
          <img src={short.thumbnail} alt={short.title} className="w-full h-auto mb-2" />
          <h2 className="font-semibold">{short.title}</h2>
          <p className="text-sm text-gray-500">
            {short.views_original}
          </p>
        </div>
      ))}

      {/* Search History */}
      <div className="mt-8">
        <SearchHistory />
      </div>
    </div>
  );
}
