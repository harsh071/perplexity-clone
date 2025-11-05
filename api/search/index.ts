// Vercel Edge Runtime declaration (enables Fetch API Request/Response signature)
export const config = { runtime: 'edge' };

// Check for both TAVILY_API_KEY and VITE_TAVILY_API_KEY (support both naming conventions)
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || process.env.VITE_TAVILY_API_KEY;
const TAVILY_SEARCH_ENDPOINT = 'https://api.tavily.com/search';

// Log API key status (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Tavily API Key Status:', TAVILY_API_KEY ? 'SET' : 'NOT SET');
  if (!TAVILY_API_KEY) {
    console.warn('⚠️  TAVILY_API_KEY not found. Please set either TAVILY_API_KEY or VITE_TAVILY_API_KEY in your .env file');
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!TAVILY_API_KEY) {
    return new Response(JSON.stringify({ 
      error: 'Tavily API key not configured',
      message: 'Please set TAVILY_API_KEY or VITE_TAVILY_API_KEY in your .env file. See README.md for setup instructions.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { query, search_depth, include_images, include_answer, max_results } = body;

    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch(TAVILY_SEARCH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TAVILY_API_KEY
      },
      body: JSON.stringify({
        query,
        search_depth: search_depth || 'advanced',
        include_images: include_images ?? true,
        include_answer: include_answer || false,
        max_results: max_results || 5
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return new Response(JSON.stringify({ 
        error: 'Tavily API error',
        message: errorText 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Search API error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ 
      error: 'Search API error',
      message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
