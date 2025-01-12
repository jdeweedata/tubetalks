'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { structureTranscript } from '@/utils/deepseek';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TranscriptData {
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
  fetchingTranscript: boolean;
  structuringContent: boolean;
  message: string;
}

export default function TranscriptPage({ params }: { params: { videoId: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [transcript, setTranscript] = useState<TranscriptData | null>(null);
  const [structuredContent, setStructuredContent] = useState<string>('');
  const [loading, setLoading] = useState<LoadingState>({
    fetchingTranscript: true,
    structuringContent: false,
    message: 'Initializing...'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTranscript() {
      if (!user) {
        setLoading(prev => ({ ...prev, fetchingTranscript: false, message: '' }));
        return;
      }

      try {
        setLoading(prev => ({
          ...prev,
          fetchingTranscript: true,
          message: `Fetching transcript for video ${params.videoId}...`
        }));

        const response = await fetch(`/api/transcripts?userId=${user.uid}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch transcript');
        }

        const foundTranscript = data.transcripts.find(
          (t: TranscriptData) => t.id === params.videoId
        );

        if (!foundTranscript) {
          throw new Error('Transcript not found');
        }

        setTranscript(foundTranscript);
        
        // Structure the transcript content
        setLoading(prev => ({
          ...prev,
          fetchingTranscript: false,
          structuringContent: true,
          message: 'Formatting transcript content...'
        }));
        
        const structured = await structureTranscript(foundTranscript.transcriptContent);
        setStructuredContent(structured);
        
        setLoading(prev => ({
          ...prev,
          structuringContent: false,
          message: ''
        }));
      } catch (err) {
        console.error('Error fetching transcript:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch transcript');
        setLoading(prev => ({
          ...prev,
          fetchingTranscript: false,
          structuringContent: false,
          message: ''
        }));
      }
    }

    fetchTranscript();
  }, [user, params.videoId]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Sign in to view transcripts
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

  if (loading.fetchingTranscript || loading.structuringContent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="mb-4">
          <LoadingSpinner />
        </div>
        <p className="text-gray-600 dark:text-gray-400 animate-pulse">
          {loading.message}
        </p>
      </div>
    );
  }

  if (error || !transcript) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error || 'Transcript not found'}
        </p>
        <button
          onClick={() => router.push('/profile')}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Back to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="relative aspect-video mb-4">
            <Image
              src={`https://i.ytimg.com/vi/${transcript.id}/maxresdefault.jpg`}
              alt={transcript.title}
              fill
              className="object-cover rounded-lg"
              unoptimized
            />
          </div>
          <h1 className="text-2xl font-bold mb-2">{transcript.title}</h1>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <span className="mr-4">{transcript.channelTitle}</span>
            <span>{new Intl.NumberFormat('en-US', { notation: 'compact' }).format(Number(transcript.viewCount))} views</span>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Transcript</h2>
              <span className="text-sm text-green-600 dark:text-green-400">
                ✓ Saved in Firestore
              </span>
            </div>
            <div className="prose dark:prose-invert max-w-none prose-headings:border-b prose-headings:border-gray-200 dark:prose-headings:border-gray-700 prose-headings:pb-2 prose-headings:mb-4">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-6" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-medium mt-4" {...props} />,
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-red-500 pl-4 italic bg-gray-50 dark:bg-gray-900 py-2 my-4" {...props} />
                  ),
                }}
              >
                {structuredContent || transcript.transcriptContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => router.push('/profile')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Back to Profile
          </button>
          <a
            href={`https://youtube.com/watch?v=${transcript.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Watch on YouTube
          </a>
        </div>
      </div>
    </div>
  );
} 