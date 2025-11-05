import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Vercel Edge Runtime declaration (enables Fetch API Request/Response signature)
export const config = { runtime: 'edge' };

// Check for both OPENAI_API_KEY and VITE_OPENAI_API_KEY (support both naming conventions)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'gpt-4o-mini';

if (process.env.NODE_ENV === 'development') {
  console.log('API Chat handler loaded. OPENAI_API_KEY:', OPENAI_API_KEY ? 'SET' : 'NOT SET');
  if (!OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not found. Please set either OPENAI_API_KEY or VITE_OPENAI_API_KEY in your .env file');
  }
}

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!openai) {
    return new Response(JSON.stringify({ 
      error: 'OpenAI API key not configured',
      message: 'Please set OPENAI_API_KEY or VITE_OPENAI_API_KEY in your .env file. See README.md for setup instructions.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { messages, model, temperature, max_tokens, tools, tool_choice, stream } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle streaming
    if (stream) {
      const streamResponse = await openai.chat.completions.create({
        messages: messages as ChatCompletionMessageParam[],
        model: model || DEFAULT_MODEL,
        stream: true,
        temperature,
        max_tokens,
        ...(tools && { tools }),
        ...(tool_choice && { tool_choice })
      });

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResponse) {
              const data = JSON.stringify(chunk) + '\n';
              controller.enqueue(new TextEncoder().encode(data));
            }
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

    // Handle non-streaming
    const response = await openai.chat.completions.create({
      messages: messages as ChatCompletionMessageParam[],
      model: model || DEFAULT_MODEL,
      stream: false,
      temperature,
      max_tokens,
      ...(tools && { tools }),
      ...(tool_choice && { tool_choice })
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return new Response(JSON.stringify({ 
      error: 'OpenAI API error',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
