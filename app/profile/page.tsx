'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import VideoCard from '@/components/video/VideoCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Transcript {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
  transcriptContent: string;
  language: string;
  availableLanguages: string[];
  createdAt: string;
}

interface LoadingState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    status: 'idle',
    message: ''
  });

  useEffect(() => {
    async function fetchTranscripts() {
      if (!user) {
        setLoading({ status: 'idle', message: '' });
        return;
      }

      try {
        setLoading({
          status: 'loading',
          message: `Fetching transcripts for user: ${user.uid}`
        });

        const response = await fetch(`/api/transcripts?userId=${user.uid}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch transcripts');
        }

        console.log(`Found ${data.transcripts.length} transcripts`);
        setTranscripts(data.transcripts);
        setLoading({
          status: 'success',
          message: `Successfully loaded ${data.transcripts.length} transcripts`
        });
      } catch (error) {
        console.error('Error fetching transcripts:', error);
        setLoading({
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to fetch transcripts'
        });
      }
    }

    fetchTranscripts();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Sign in to view your transcripts
        </p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Transcripts</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user.displayName || user.email}
            </p>
          </div>
          {loading.status === 'loading' && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <LoadingSpinner />
              <span className="animate-pulse">{loading.message}</span>
            </div>
          )}
          {loading.status === 'success' && (
            <div className="text-sm text-green-600 dark:text-green-400">
              ✓ {loading.message}
            </div>
          )}
        </div>

        {loading.status === 'error' ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{loading.message}</p>
          </div>
        ) : loading.status === 'loading' && transcripts.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 dark:bg-gray-800 rounded-lg aspect-video animate-pulse"
              />
            ))}
          </div>
        ) : transcripts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {transcripts.map((transcript) => (
              <VideoCard
                key={transcript.id}
                video={transcript}
                isTranscribed={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No transcripts found. Start by transcribing a video from the search page.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Search Videos
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 