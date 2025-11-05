import { DEFAULT_MODEL } from '../config/api-config';
import { SYSTEM_PROMPTS, USER_PROMPTS } from '../config/prompts';
import { TOOLS, type WebSearchOptions, type TavilySearchResult, DEFAULT_SEARCH_OPTIONS } from './tool-service';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

/**
 * Determines whether a web search is necessary for a given query
 */
export async function shouldPerformWebSearch(query: string, language: string = 'en'): Promise<boolean> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPTS.SEARCH_NECESSITY_CHECK(language)
          },
          {
            role: 'user',
            content: USER_PROMPTS.SEARCH_CHECK(query)
          }
        ],
        model: DEFAULT_MODEL,
        stream: false,
        temperature: 0,
        max_tokens: 5
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const decision = data.choices?.[0]?.message?.content?.toLowerCase().includes('true') ?? false;
    return decision;
  } catch (error) {
    console.error('Error determining search necessity:', error);
    return true; // Default to searching if the check fails
  }
}

/**
 * Performs a web search using the Tavily API
 */
export async function searchWeb(
  query: string, 
  options: WebSearchOptions = DEFAULT_SEARCH_OPTIONS
): Promise<TavilySearchResult[]> {
  const needsSearch = await shouldPerformWebSearch(query);
  if (!needsSearch) {
    console.log('Web search deemed unnecessary for this query');
    return [];
  }

  try {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        ...options
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('Tavily API error details:', errorText);
      throw new Error(`Tavily API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) {
      console.warn('Invalid response format from Tavily API');
      return [];
    }
    return data.results;
  } catch (error) {
    console.error('Error searching web:', error);
    return [];
  }
}

interface StreamHandlers {
  onToken?: (token: string) => void;
  onToolCall?: (toolCallChunk: string) => void;
}

/**
 * Creates a chat completion with streaming support
 */
export async function createChatCompletion(
  messages: ChatCompletionMessageParam[],
  options: {
    tools?: typeof TOOLS[keyof typeof TOOLS]['tool'][],
    toolChoice?: { type: "function", function: { name: string } },
    handlers?: StreamHandlers
  } = {}
) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages,
      model: DEFAULT_MODEL,
      stream: true,
      ...(options.tools && { tools: options.tools }),
      ...(options.toolChoice && { tool_choice: options.toolChoice })
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = '';
  let toolCallResponse = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          const content = data.choices?.[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            options.handlers?.onToken?.(content);
          }

          const toolCallChunk = data.choices?.[0]?.delta?.tool_calls?.[0]?.function?.arguments || '';
          if (toolCallChunk) {
            toolCallResponse += toolCallChunk;
            options.handlers?.onToolCall?.(toolCallChunk);
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return {
    content: fullResponse,
    toolCallResponse
  };
}

/**
 * Formats search results into a context string
 */
export function formatSearchContext(results: TavilySearchResult[]): string {
  return results
    .map(result => `[Source: ${result.title}]\n${result.snippet}\n`)
    .join('\n');
}

/**
 * Creates messages array for the main chat completion
 */
export function createMainChatMessages(
  conversationHistory: ChatCompletionMessageParam[],
  query: string,
  searchContext: string | null,
  language: string
): ChatCompletionMessageParam[] {
  return [
    { 
      role: 'system', 
      content: `${SYSTEM_PROMPTS.MAIN_ASSISTANT(language)}\n\nIMPORTANT: You MUST respond ONLY in ${language}. This is a strict requirement - do not use any other language under any circumstances. If you cannot provide an answer in ${language}, respond with an error message in ${language}.${searchContext ? "\n\nUse the search results provided to enhance your responses, and always cite your sources when using information from them." : ""}`
    },
    ...conversationHistory,
    ...(searchContext ? [{
      role: 'user' as const,
      content: `Search Results:\n${searchContext}`
    }] : []),
    {
      role: 'user',
      content: query
    }
  ];
}

/**
 * Creates messages array for generating related questions
 */
export function createRelatedQuestionsMessages(
  conversationHistory: ChatCompletionMessageParam[],
  query: string,
  previousTopic: string | undefined,
  language: string
): ChatCompletionMessageParam[] {
  return [
    {
      role: 'system',
      content: `${SYSTEM_PROMPTS.RELATED_QUESTIONS(language)}\n\nIMPORTANT: You MUST generate all questions ONLY in ${language}. This is a strict requirement - do not use any other language under any circumstances.`
    },
    ...conversationHistory,
    {
      role: 'user',
      content: previousTopic 
        ? `Previous topic: ${previousTopic}\nNew question: ${query}`
        : query
    }
  ];
} 