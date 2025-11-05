// Vercel Edge Runtime declaration (enables Fetch API Request/Response signature)
export const config = { runtime: 'edge' };

// Check for both TAVILY_API_KEY and VITE_TAVILY_API_KEY (support both naming conventions)
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || process.env.VITE_TAVILY_API_KEY;
const TAVILY_SEARCH_ENDPOINT = 'https://api.tavily.com/search';

// Log API key status (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Tavily API Key Status (News):', TAVILY_API_KEY ? 'SET' : 'NOT SET');
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
    const { category, searchType, maxResults } = body;

    if (!category || typeof category !== 'string') {
      return new Response(JSON.stringify({ error: 'Category is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const searchQueries = {
      latest: `latest breaking ${category} news today`,
      top: `top trending ${category} news this week`
    };

    const query = searchQueries[searchType as 'latest' | 'top'] || searchQueries.latest;

    const response = await fetch(TAVILY_SEARCH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TAVILY_API_KEY}`
      },
      body: JSON.stringify({
        query,
        search_depth: 'advanced',
        include_images: true,
        include_image_descriptions: true,
        include_answer: false,
        max_results: maxResults || 25,
        filter: {
          domain_types: ['news'],
          time_period: searchType === 'latest' ? 'last_day' : 'last_week',
          exclude_domains: [
            'wikipedia.org', 'reddit.com', 'youtube.com',
            'facebook.com', 'twitter.com', 'instagram.com',
            'tiktok.com', 'pinterest.com'
          ],
          content_type: ['news']
        },
        search_params: {
          sort_by: searchType === 'latest' ? 'date' : 'relevance'
        }
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
    console.error('News API error:', error);
    return new Response(JSON.stringify({ 
      error: 'News API error',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
