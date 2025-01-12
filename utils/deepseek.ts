export async function structureTranscript(rawTranscript: string) {
  try {
    const response = await fetch('/api/structure-transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript: rawTranscript
      })
    });

    if (!response.ok) {
      throw new Error('Failed to structure transcript');
    }

    const data = await response.json();
    
    // Log cache usage statistics
    if (data.usage) {
      console.log('DeepSeek API Cache Stats:', {
        hitTokens: data.usage.cache_hit_tokens,
        missTokens: data.usage.cache_miss_tokens,
        hitRate: data.usage.cache_hit_tokens / (data.usage.cache_hit_tokens + data.usage.cache_miss_tokens)
      });
    }
    
    return data.content;
  } catch (error) {
    console.error('Error structuring transcript:', error);
    return rawTranscript; // Return original transcript if processing fails
  }
} 