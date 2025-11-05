import { BaseAPIService } from './base-api';
import { USE_MOCK_MODE, AUTO_FALLBACK_TO_MOCK } from '../../config/api-config';
import { MockService } from '../mocks/mock-service';

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
    if (USE_MOCK_MODE) {
      console.log('[Mock Mode] Using mock Tavily API');
      const mockService = MockService.getInstance();
      return mockService.searchWeb(query, options.max_results || 5);
    }

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
      if (AUTO_FALLBACK_TO_MOCK) {
        console.warn('[Auto Mock Fallback] Tavily search failed. Using mock results.', error);
        const mockService = MockService.getInstance();
        return mockService.searchWeb(query, options.max_results || 5);
      }
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