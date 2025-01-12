import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { useState, useEffect } from 'react';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Get existing searches from cookies
    const existingSearches = cookies().get('searchHistory')?.value || '[]';
    const searches = JSON.parse(existingSearches);

    // Add new search and limit to last 10 searches
    const updatedSearches = [query, ...searches].slice(0, 10);

    // Save back to cookies
    cookies().set('searchHistory', JSON.stringify(updatedSearches), {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving search:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 