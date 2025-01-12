import { NextResponse } from 'next/server';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Example of well-formatted transcript with markdown structure
const EXAMPLE_TRANSCRIPT = `# AI Technology Discussion

## Introduction
[00:00:15] Speaker 1: Welcome to this discussion on AI technology. Let's begin with the basics.
First, I'd like to talk about machine learning fundamentals.

## Neural Networks Overview
[00:00:30] Speaker 2: That's a great starting point. Could you explain neural networks?
I think many viewers would benefit from understanding this concept.

### Basic Concepts
[00:00:45] Speaker 1: Absolutely. Neural networks are inspired by the human brain...

> Note: This section covers fundamental concepts that will be built upon later.`;

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript content is required' },
        { status: 400 }
      );
    }

    const messages = [
      {
        role: 'system',
        content: `You are a transcript formatter specializing in creating well-structured markdown documents. Format the content following these rules:

1. Add a main title (H1) for the video topic
2. Organize content into logical sections with appropriate headings (H2, H3)
3. Include speaker attribution and timestamps at the start of their segments
4. Format key points and important quotes using markdown syntax
5. Use paragraphs to separate different topics or thoughts
6. Add blockquotes for important highlights or summary points
7. Maintain chronological order and all original information
8. Keep the content readable and well-organized`
      },
      {
        role: 'user',
        content: EXAMPLE_TRANSCRIPT
      },
      {
        role: 'assistant',
        content: 'I have formatted the transcript into a well-structured markdown document:\n\n' + EXAMPLE_TRANSCRIPT
      },
      {
        role: 'user',
        content: transcript
      }
    ];

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: 'text' }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to structure transcript');
    }

    const data = await response.json();
    
    // Log cache hit status
    console.log('Cache hit tokens:', data.usage?.prompt_cache_hit_tokens);
    console.log('Cache miss tokens:', data.usage?.prompt_cache_miss_tokens);
    
    return NextResponse.json({ 
      content: data.choices[0].message.content,
      usage: {
        cache_hit_tokens: data.usage?.prompt_cache_hit_tokens,
        cache_miss_tokens: data.usage?.prompt_cache_miss_tokens
      }
    });
  } catch (error) {
    console.error('Error structuring transcript:', error);
    return NextResponse.json(
      { error: 'Failed to structure transcript' },
      { status: 500 }
    );
  }
} 