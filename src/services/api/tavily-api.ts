import { BaseAPIService } from './base-api';

export interface TavilySearchResult {
  title: string;
  url: string;
  snippet: string;
  score: number;
  published_date?: string;
  domain: string;
  image_url?: string;
}

export interface TavilySearchOptions {
  search_depth?: "basic" | "advanced";
  include_images?: boolean;
  include_answer?: boolean;
  max_results?: number;
}

export const DEFAULT_SEARCH_OPTIONS: TavilySearchOptions = {
  search_depth: "advanced",
  include_images: false,
  include_answer: false,
  max_results: 5
} as const;

export class TavilyAPI extends BaseAPIService {
  /**
   * Perform a web search using the Tavily API
   */
  async search(
    query: string,
    options: TavilySearchOptions = DEFAULT_SEARCH_OPTIONS
  ): Promise<TavilySearchResult[]> {
    try {
      const data = await this.fetchWithErrorHandling<{ results: TavilySearchResult[] }>(
        '/api/search',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query,
            ...options
          })
        },
        'Tavily API'
      );

      return data.results || [];
    } catch (error) {
      console.error('Error searching web:', error);
      return [];
    }
  }

  /**
   * Format search results into a context string
   */
  formatResults(results: TavilySearchResult[]): string {
    return results
      .map(result => `[Source: ${result.title}]\n${result.snippet}\n`)
      .join('\n');
  }
} 