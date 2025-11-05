import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { TavilySearchResult } from '../api/tavily-api';
import type { NewsArticle } from '../api/news-api';

/**
 * Mock service that provides realistic mock data for all API endpoints
 * This allows the app to work without any external API connections
 */

// Mock search results database
const MOCK_SEARCH_RESULTS: Record<string, TavilySearchResult[]> = {
  default: [
    {
      title: 'Wikipedia - Comprehensive Information',
      url: 'https://en.wikipedia.org/wiki/example',
      snippet: 'This is a comprehensive source of information about the topic you\'re asking about. It provides detailed explanations and context.',
      score: 0.95,
      domain: 'wikipedia.org',
      published_date: new Date().toISOString()
    },
    {
      title: 'Academic Research Paper',
      url: 'https://example.com/research',
      snippet: 'Recent research findings and academic analysis on this subject matter. Peer-reviewed sources provide authoritative information.',
      score: 0.92,
      domain: 'research.edu',
      published_date: new Date().toISOString()
    },
    {
      title: 'Expert Analysis and Insights',
      url: 'https://example.com/analysis',
      snippet: 'In-depth analysis from industry experts covering various aspects of the topic. Includes practical applications and real-world examples.',
      score: 0.88,
      domain: 'expert.com',
      published_date: new Date().toISOString()
    },
    {
      title: 'Official Documentation',
      url: 'https://example.com/docs',
      snippet: 'Official documentation and specifications. Provides technical details and implementation guidelines.',
      score: 0.85,
      domain: 'docs.example.com',
      published_date: new Date().toISOString()
    },
    {
      title: 'News Article - Latest Updates',
      url: 'https://example.com/news',
      snippet: 'Latest news and developments related to this topic. Includes recent events and current trends.',
      score: 0.82,
      domain: 'news.example.com',
      published_date: new Date().toISOString()
    }
  ]
};

// Mock news articles database
const MOCK_NEWS_BY_CATEGORY: Record<string, NewsArticle[]> = {
  general: [
    {
      title: 'Breaking: Major Global Development Unfolds',
      url: 'https://example.com/news/breaking-1',
      snippet: 'Significant developments are happening around the world that could impact multiple sectors and regions.',
      domain: 'news.example.com',
      published_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://via.placeholder.com/400x225?text=News+1',
      imageDescription: 'Breaking news image'
    },
    {
      title: 'Technology Advances Change Industry Landscape',
      url: 'https://example.com/news/tech-1',
      snippet: 'New technological innovations are reshaping how businesses operate and interact with customers.',
      domain: 'tech.example.com',
      published_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://via.placeholder.com/400x225?text=Tech+News',
      imageDescription: 'Technology news image'
    },
    {
      title: 'Economic Trends Show Positive Growth',
      url: 'https://example.com/news/economy-1',
      snippet: 'Economic indicators suggest positive trends in multiple sectors, with experts predicting continued growth.',
      domain: 'finance.example.com',
      published_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://via.placeholder.com/400x225?text=Economy',
      imageDescription: 'Economic news image'
    }
  ],
  business: [
    {
      title: 'Corporate Strategy Shifts in 2024',
      url: 'https://example.com/news/business-1',
      snippet: 'Major corporations are adapting their strategies to meet changing market demands and consumer expectations.',
      domain: 'business.example.com',
      published_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://via.placeholder.com/400x225?text=Business',
      imageDescription: 'Business news image'
    },
    {
      title: 'Startup Funding Reaches New Heights',
      url: 'https://example.com/news/business-2',
      snippet: 'Venture capital investments continue to flow into innovative startups across various industries.',
      domain: 'vc.example.com',
      published_date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://via.placeholder.com/400x225?text=Startups',
      imageDescription: 'Startup news image'
    }
  ],
  science: [
    {
      title: 'Scientific Breakthrough in Medical Research',
      url: 'https://example.com/news/science-1',
      snippet: 'Researchers make significant progress in understanding complex medical conditions and potential treatments.',
      domain: 'science.example.com',
      published_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://via.placeholder.com/400x225?text=Science',
      imageDescription: 'Science news image'
    }
  ],
  world: [
    {
      title: 'Global Events Shape International Relations',
      url: 'https://example.com/news/world-1',
      snippet: 'Recent developments in international affairs are reshaping diplomatic relationships and global policies.',
      domain: 'world.example.com',
      published_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://via.placeholder.com/400x225?text=World',
      imageDescription: 'World news image'
    }
  ],
  entertainment: [
    {
      title: 'Entertainment Industry Announces Major Releases',
      url: 'https://example.com/news/entertainment-1',
      snippet: 'Upcoming releases and announcements from the entertainment industry are generating excitement among fans.',
      domain: 'entertainment.example.com',
      published_date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://via.placeholder.com/400x225?text=Entertainment',
      imageDescription: 'Entertainment news image'
    }
  ],
  gaming: [
    {
      title: 'New Gaming Technologies Transform Player Experience',
      url: 'https://example.com/news/gaming-1',
      snippet: 'Latest gaming innovations are revolutionizing how players interact with virtual worlds and game mechanics.',
      domain: 'gaming.example.com',
      published_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://via.placeholder.com/400x225?text=Gaming',
      imageDescription: 'Gaming news image'
    }
  ],
  health: [
    {
      title: 'Health Innovations Improve Patient Outcomes',
      url: 'https://example.com/news/health-1',
      snippet: 'New health technologies and medical advances are improving treatment options and patient care.',
      domain: 'health.example.com',
      published_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://via.placeholder.com/400x225?text=Health',
      imageDescription: 'Health news image'
    }
  ],
  finance: [
    {
      title: 'Financial Markets Show Strong Performance',
      url: 'https://example.com/news/finance-1',
      snippet: 'Market trends and financial indicators point to positive developments in various economic sectors.',
      domain: 'finance.example.com',
      published_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      imageUrl: 'https://via.placeholder.com/400x225?text=Finance',
      imageDescription: 'Finance news image'
    }
  ]
};

// Generate mock response based on query
const generateMockResponse = (query: string, language: string = 'en'): string => {
  const lowerQuery = query.toLowerCase();
  
  // Simple keyword-based responses
  if (lowerQuery.includes('what is') || lowerQuery.includes('what are')) {
    return `Based on the available information, I can explain this topic for you. ${query} is a complex subject that involves multiple aspects. Let me break it down:\n\n1. **Core Concept**: The fundamental idea relates to how this concept works in practice.\n\n2. **Key Components**: There are several important elements to consider, including practical applications and theoretical foundations.\n\n3. **Real-World Applications**: This concept has been applied in various contexts, showing significant impact in different industries.\n\n4. **Current Trends**: Recent developments suggest that this area is evolving rapidly, with new innovations emerging regularly.\n\nWould you like me to dive deeper into any specific aspect of this topic?`;
  }
  
  if (lowerQuery.includes('how') || lowerQuery.includes('how to')) {
    return `Here's a step-by-step guide on ${query}:\n\n**Step 1: Getting Started**\nBegin by understanding the basic requirements and prerequisites for this task.\n\n**Step 2: Preparation**\nGather all necessary resources and tools needed to proceed effectively.\n\n**Step 3: Implementation**\nFollow the established process, making sure to pay attention to important details.\n\n**Step 4: Verification**\nCheck your work and ensure everything is functioning as expected.\n\n**Step 5: Optimization**\nConsider ways to improve efficiency and effectiveness based on your results.\n\nThis approach has been proven effective in various scenarios. Would you like more details on any specific step?`;
  }
  
  if (lowerQuery.includes('why')) {
    return `There are several important reasons why ${query}:\n\n1. **Primary Reason**: The most significant factor is related to fundamental principles and established practices.\n\n2. **Supporting Factors**: Additional considerations include efficiency, effectiveness, and long-term benefits.\n\n3. **Historical Context**: Looking at past developments, this trend has been building for some time.\n\n4. **Practical Benefits**: In practice, this approach offers concrete advantages that make it worthwhile.\n\nUnderstanding these reasons helps provide context for why this topic matters and how it affects various aspects.`;
  }
  
  // Default comprehensive response
  return `Thank you for your question about "${query}". Let me provide you with a comprehensive answer.\n\n**Overview**\nThis is an important topic that touches on several key areas. Based on current information and research, I can share the following insights:\n\n**Main Points**\n1. The topic involves multiple interconnected elements that work together to create a cohesive system.\n2. Recent developments have shown significant progress in understanding and applying these concepts.\n3. Practical applications demonstrate real-world value and effectiveness.\n4. Future trends suggest continued evolution and improvement in this area.\n\n**Key Considerations**\nWhen exploring this topic, it's important to consider various perspectives and factors. Different approaches may work better in different contexts, so flexibility and adaptability are valuable.\n\n**Additional Information**\nFor more detailed information, I recommend exploring authoritative sources and expert opinions on this subject. Would you like me to elaborate on any specific aspect?`;
};

// Simulate streaming response
const simulateStreaming = async (
  text: string,
  onToken: (token: string) => void,
  delay: number = 30
): Promise<void> => {
  const words = text.split(' ');
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const token = i === 0 ? word : ` ${word}`;
    await new Promise(resolve => setTimeout(resolve, delay));
    onToken(token);
  }
};

export class MockService {
  private static instance: MockService;
  private delay: number;

  private constructor(delay: number = 30) {
    this.delay = delay;
  }

  public static getInstance(delay?: number): MockService {
    if (!MockService.instance) {
      MockService.instance = new MockService(delay);
    }
    return MockService.instance;
  }

  /**
   * Mock chat completion with streaming support
   */
  async createChatCompletion(
    messages: ChatCompletionMessageParam[],
    options: {
      tools?: any[];
      toolChoice?: { type: "function"; function: { name: string } };
      handlers?: {
        onToken?: (token: string) => void;
        onToolCall?: (toolCallChunk: string) => void;
      };
    } = {}
  ): Promise<{ content: string; toolCallResponse?: string }> {
    // Extract user query
    const userMessage = messages.find(m => m.role === 'user');
    const query = userMessage?.content || 'Hello';
    
    // Extract language from system message if available
    const systemMessage = messages.find(m => m.role === 'system');
    const language = systemMessage?.content?.includes('en') ? 'en' : 'en';
    
    // Generate mock response
    let fullResponse = generateMockResponse(query, language);
    
    // Handle tool calls
    if (options.toolChoice && options.toolChoice.function.name === 'get_related_questions') {
      const relatedQuestions = [
        "Can you explain this in more detail?",
        "What are the main benefits?",
        "How does this compare to alternatives?",
        "What are some practical examples?",
        "Are there any limitations I should know about?"
      ];
      
      const toolResponse = JSON.stringify({ questions: relatedQuestions });
      
      if (options.handlers?.onToolCall) {
        // Simulate streaming tool call
        for (const char of toolResponse) {
          await new Promise(resolve => setTimeout(resolve, 10));
          options.handlers.onToolCall(char);
        }
      }
      
      return {
        content: '',
        toolCallResponse: toolResponse
      };
    }
    
    // Handle streaming
    if (options.handlers?.onToken) {
      await simulateStreaming(fullResponse, options.handlers.onToken, this.delay);
    }
    
    return {
      content: fullResponse
    };
  }

  /**
   * Mock simple chat completion (non-streaming)
   */
  async createSimpleChatCompletion(
    messages: ChatCompletionMessageParam[]
  ): Promise<string> {
    const userMessage = messages.find(m => m.role === 'user');
    const query = userMessage?.content || 'Hello';
    
    // For search necessity check
    if (query.includes('search') || query.includes('find') || query.includes('latest')) {
      return 'true';
    }
    
    return generateMockResponse(query);
  }

  /**
   * Mock web search
   */
  async searchWeb(query: string, maxResults: number = 5): Promise<TavilySearchResult[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock results based on query or default
    const results = MOCK_SEARCH_RESULTS.default || [];
    
    // Customize results based on query keywords
    const customizedResults = results.map((result, index) => ({
      ...result,
      title: result.title.replace('example', query.split(' ')[0] || 'topic'),
      snippet: result.snippet.replace('topic', query)
    }));
    
    return customizedResults.slice(0, maxResults);
  }

  /**
   * Mock news API
   */
  async getNewsByCategory(category: string, maxResults: number = 10): Promise<NewsArticle[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Get category-specific news or default to general
    const categoryNews = MOCK_NEWS_BY_CATEGORY[category] || MOCK_NEWS_BY_CATEGORY.general || [];
    
    // Generate additional articles if needed
    const additionalArticles: NewsArticle[] = [];
    for (let i = categoryNews.length; i < maxResults; i++) {
      additionalArticles.push({
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} News Article ${i + 1}`,
        url: `https://example.com/news/${category}-${i + 1}`,
        snippet: `This is article ${i + 1} in the ${category} category. It contains relevant information about current events and trends.`,
        domain: 'news.example.com',
        published_date: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        imageUrl: `https://via.placeholder.com/400x225?text=${category}+${i + 1}`,
        imageDescription: `${category} news image ${i + 1}`
      });
    }
    
    return [...categoryNews, ...additionalArticles].slice(0, maxResults);
  }

  /**
   * Mock agent planning
   */
  async planAgent(query: string, language: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      answer: `Plan for handling: ${query}`,
      sources: [],
      confidence: 0.85,
      steps: [
        {
          id: 1,
          description: `Analyzing query in ${language}`,
          requires_search: true,
          requires_tools: ['web_search'],
          status: 'pending'
        },
        {
          id: 2,
          description: `Gathering information in ${language}`,
          requires_search: true,
          requires_tools: [],
          status: 'pending'
        },
        {
          id: 3,
          description: `Synthesizing response in ${language}`,
          requires_search: false,
          requires_tools: [],
          status: 'pending'
        }
      ]
    };
  }

  /**
   * Mock agent search
   */
  async searchAgent(query: string, plan: any, language: string): Promise<TavilySearchResult[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return this.searchWeb(query, 5);
  }

  /**
   * Mock agent consolidation
   */
  async consolidateAgent(
    query: string,
    plan: any,
    searchResults: TavilySearchResult[],
    language: string
  ): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const sources = searchResults.map(result => ({
      title: result.title,
      url: result.url
    }));
    
    return {
      answer: `${generateMockResponse(query, language)}\n\nSources: ${sources.map((s, i) => `[${i + 1}] ${s.title}`).join(', ')}`,
      sources,
      confidence: 0.9
    };
  }

  /**
   * Mock related questions generation
   */
  async generateRelatedQuestions(query: string, language: string = 'en'): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return [
      "Can you provide more details about this?",
      "What are the key benefits?",
      "How does this compare to alternatives?",
      "What are some practical examples?",
      "Are there any important limitations?"
    ];
  }
}

