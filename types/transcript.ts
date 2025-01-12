export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscriptMetadata {
  duration: number;
  language: string;
}

export interface Transcript {
  videoId: string;
  userId: string;
  title: string;
  timestamp: string;
  segments: TranscriptSegment[];
  metadata: TranscriptMetadata;
}

export interface TranscriptResponse {
  success: boolean;
  transcript?: Transcript;
  error?: string;
  message?: string;
} 