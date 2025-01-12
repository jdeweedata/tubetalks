'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import VideoCard from '@/components/video/VideoCard';
import type { YouTubeVideo } from '@/types/youtube';

export default function TranscriptsPage() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [transcripts, setTranscripts] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTranscripts() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/transcripts?userId=${user.uid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch transcripts');
        }
        const data = await response.json();
        setTranscripts(data.transcripts);
      } catch (error) {
        console.error('Error fetching transcripts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTranscripts();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Sign in to view your transcripts</h1>
            <button
              onClick={() => signInWithGoogle()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign In with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Transcripts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and manage your transcribed videos
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          </div>
        ) : transcripts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transcripts.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No transcripts found. Start by transcribing some videos!</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Search Videos
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 