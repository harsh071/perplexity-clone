import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { DEFAULT_MODEL, USE_MOCK_MODE } from '../../config/api-config';
import { ToolDefinition } from '../tools/tool-registry';
import { MockService } from '../mocks/mock-service';

export interface StreamHandlers {
  onToken?: (token: string) => void;
  onToolCall?: (toolCallChunk: string) => void;
}

export interface ChatCompletionOptions {
  tools?: ToolDefinition['tool'][];
  toolChoice?: { type: "function"; function: { name: string } };
  handlers?: StreamHandlers;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export class OpenAIAPI {
  /**
   * Create a chat completion with streaming support
   */
  async createChatCompletion(
    messages: ChatCompletionMessageParam[],
    options: ChatCompletionOptions = {}
  ) {
    if (USE_MOCK_MODE) {
      console.log('[Mock Mode] Using mock OpenAI API');
      const mockService = MockService.getInstance();
      return mockService.createChatCompletion(messages, {
        tools: options.tools,
        toolChoice: options.toolChoice,
        handlers: options.handlers
      });
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages,
        model: options.model || DEFAULT_MODEL,
        stream: true,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
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
   * Create a simple chat completion without streaming
   */
  async createSimpleChatCompletion(
    messages: ChatCompletionMessageParam[],
    options: Omit<ChatCompletionOptions, 'handlers'> = {}
  ) {
    if (USE_MOCK_MODE) {
      console.log('[Mock Mode] Using mock OpenAI API (simple)');
      const mockService = MockService.getInstance();
      const result = await mockService.createSimpleChatCompletion(messages);
      return result;
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages,
        model: options.model || DEFAULT_MODEL,
        stream: false,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        ...(options.tools && { tools: options.tools }),
        ...(options.toolChoice && { tool_choice: options.toolChoice })
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }
} 