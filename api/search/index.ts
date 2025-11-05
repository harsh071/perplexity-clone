import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TAVILY_SEARCH_ENDPOINT = 'https://api.tavily.com/search';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!TAVILY_API_KEY) {
    return new Response(JSON.stringify({ error: 'Tavily API key not configured' }), {
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
        'Authorization': `Bearer ${TAVILY_API_KEY}`
      },
      body: JSON.stringify({
        query,
        search_depth: search_depth || 'advanced',
        include_images: include_images || false,
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
  } catch (error: any) {
    console.error('Search API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Search API error',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
