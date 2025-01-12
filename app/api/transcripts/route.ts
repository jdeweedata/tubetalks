import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

function getFirestoreInstance() {
  const apps = admin.apps;
  if (!apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return admin.firestore();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('Fetching transcripts for user:', userId);

    const db = getFirestoreInstance();
    let transcriptsSnapshot;
    let isOrdered = true;

    try {
      // Try with ordering first
      transcriptsSnapshot = await db
        .collection('transcripts')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
    } catch (error) {
      console.log('Index not ready, fetching without ordering:', error);
      // Fallback to just filtering by userId if index isn't ready
      transcriptsSnapshot = await db
        .collection('transcripts')
        .where('userId', '==', userId)
        .get();
      isOrdered = false;
    }

    console.log('Found transcripts:', transcriptsSnapshot.size);

    const transcripts = [];
    for (const doc of transcriptsSnapshot.docs) {
      const data = doc.data();
      console.log('Processing transcript:', data);

      // Convert Firestore Timestamp to ISO string
      const createdAt = data.createdAt?.toDate?.() || new Date();
      const publishedAt = data.publishedAt || createdAt.toISOString();

      transcripts.push({
        id: data.videoId,
        title: data.title,
        description: data.description || '',
        thumbnailUrl: data.thumbnailUrl || '',
        channelTitle: data.channelTitle || '',
        publishedAt: publishedAt,
        viewCount: data.viewCount || '0',
        duration: data.duration || '0:00',
        transcriptContent: data.content,
        language: data.language || 'en',
        availableLanguages: data.availableLanguages || ['en'],
        createdAt: createdAt.toISOString(),
      });
    }

    // Sort manually if we couldn't use orderBy
    if (!isOrdered) {
      transcripts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    console.log('Returning transcripts:', transcripts.length);
    return NextResponse.json({ transcripts });
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transcripts' },
      { status: 500 }
    );
  }
} 