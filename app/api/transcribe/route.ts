import { NextResponse } from 'next/server';
import { getFirebaseAdminDB } from '@/lib/firebase-admin';

// Ensure SUPADATA_API_KEY is in your .env.local file
const SUPADATA_API_KEY = process.env.SUPADATA_API_KEY;

export async function POST(request: Request) {
  try {
    if (!SUPADATA_API_KEY) {
      throw new Error('SUPADATA_API_KEY is not configured');
    }

    const { videoId, title, userId } = await request.json();
    
    if (!videoId || !title || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get transcript from Supadata API
    const transcriptResponse = await fetch(
      `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&text=true&lang=en`,
      {
        headers: {
          'x-api-key': SUPADATA_API_KEY,
        },
      }
    );

    if (!transcriptResponse.ok) {
      const error = await transcriptResponse.json();
      throw new Error(`Supadata API error: ${error.message || transcriptResponse.statusText}`);
    }

    const transcriptData = await transcriptResponse.json();
    
    // Store transcript in Firestore
    const db = getFirebaseAdminDB();
    await db.collection('transcripts').add({
      userId,
      videoId,
      title,
      content: transcriptData.content,
      language: transcriptData.lang,
      availableLanguages: transcriptData.availableLangs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      language: transcriptData.lang,
      availableLanguages: transcriptData.availableLangs
    });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to transcribe video' 
      },
      { status: 500 }
    );
  }
} 