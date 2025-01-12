'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    channelTitle: string;
    publishedAt: string;
    viewCount: string;
    duration: string;
  };
  isTranscribed?: boolean;
}

export default function VideoCard({ video, isTranscribed = false }: VideoCardProps) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  // Get high quality thumbnail URL
  const getHighQualityThumbnail = (url: string) => {
    // If it's already a full URL, return it
    if (url.startsWith('http')) return url;
    // If it's a video ID, construct the URL
    return `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
  };

  const handleTranscribe = async () => {
    if (!user) {
      alert('Please sign in to transcribe videos');
      return;
    }

    if (isTranscribed) {
      // If already transcribed, navigate to view the transcript
      router.push(`/transcripts/${video.id}`);
      return;
    }

    try {
      setIsTranscribing(true);
      setError('');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: video.id,
          title: video.title,
          userId: user.uid,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to transcribe video');
      }

      router.push(`/transcripts/${video.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transcribe video');
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg">
      <div className="relative aspect-video">
        <Image
          src={getHighQualityThumbnail(video.thumbnailUrl)}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized // Add this for external images
        />
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-sm px-2 py-1 rounded">
            {video.duration}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 hover:line-clamp-none">
          {video.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
          {video.channelTitle}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span>{new Intl.NumberFormat('en-US', { notation: 'compact' }).format(Number(video.viewCount))} views</span>
          <span>{formatDate(video.publishedAt)}</span>
        </div>
        <button
          onClick={handleTranscribe}
          disabled={isTranscribing}
          className={`w-full py-2 px-4 rounded-lg transition-colors ${
            isTranscribing
              ? 'bg-gray-400 cursor-not-allowed'
              : isTranscribed
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-red-500 hover:bg-red-600'
          } text-white font-medium`}
        >
          {isTranscribing ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Transcribing...
            </span>
          ) : isTranscribed ? (
            'View Transcript'
          ) : (
            'Transcribe'
          )}
        </button>
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
} 