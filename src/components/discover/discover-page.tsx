import { useEffect, useState, useCallback } from 'react';
import { 
  Newspaper, Briefcase, Globe, Microscope, Film, Gamepad, Heart, DollarSign, 
  Loader2, FileText, Star, List, X, MapPin
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { serviceManager } from '../../services/service-manager';
import type { NewsArticle } from '../../services/api/news-api';

export const NEWS_CATEGORIES = [
  { id: 'general', label: 'General', icon: Newspaper },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'world', label: 'World', icon: Globe },
  { id: 'science', label: 'Science', icon: Microscope },
  { id: 'entertainment', label: 'Entertainment', icon: Film },
  { id: 'gaming', label: 'Gaming', icon: Gamepad },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'finance', label: 'Finance', icon: DollarSign },
] as const;

type CategoryId = typeof NEWS_CATEGORIES[number]['id'];

type CategoryNews = {
  [K in CategoryId]: NewsArticle[];
};

type FetchTimes = {
  [K in CategoryId]?: number;
};

type TabType = 'for-you' | 'top' | 'topics';

const RATE_LIMIT_MS = 60 * 1000;
const INITIAL_CATEGORY: CategoryId = 'general';

const globalNewsCache: Partial<CategoryNews> = {};
const globalFetchTimes: FetchTimes = {};

const INITIAL_ARTICLES_COUNT = 9;
const ARTICLES_PER_LOAD = 6;


const INTEREST_TOPICS = [
  'Tech & Science',
  'Finance',
  'Arts & Culture',
  'Sports',
  'Entertainment',
];

function LoadingCards({ count }: { count: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white animate-pulse rounded-lg overflow-hidden shadow-sm border border-gray-100">
          <div className="aspect-video bg-gray-200"></div>
          <div className="p-4 space-y-3">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function DiscoverPage() {
  const [selectedTab, setSelectedTab] = useState<TabType>('for-you');
  const [selectedCategory] = useState<CategoryId>(INITIAL_CATEGORY);
  const [newsCache, setNewsCache] = useState<Partial<CategoryNews>>(globalNewsCache);
  const [isLoading, setIsLoading] = useState(!globalNewsCache[INITIAL_CATEGORY]);
  const [lastFetchTimes, setLastFetchTimes] = useState<FetchTimes>(globalFetchTimes);
  const [displayCount, setDisplayCount] = useState(INITIAL_ARTICLES_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Tech & Science', 'Finance']);
  const [showMakeItYours, setShowMakeItYours] = useState(true);

  const loadCategoryNews = useCallback(async (categoryId: CategoryId, count: number) => {
    const now = Date.now();
    const lastFetch = lastFetchTimes[categoryId] || 0;
    const currentCachedArticles = newsCache[categoryId] || [];
    
    if (now - lastFetch < RATE_LIMIT_MS && currentCachedArticles.length >= count) {
      return;
    }

    const isLoadingMore = currentCachedArticles.length > 0;
    if (!isLoadingMore) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    const newsApi = serviceManager.getNewsAPI();
    
    try {
      const articles = await newsApi.getNewsByCategory(categoryId, count);
      const updatedCache = {
        ...newsCache,
        [categoryId]: articles
      };
      setNewsCache(updatedCache);
      Object.assign(globalNewsCache, updatedCache);

      const updatedFetchTimes = {
        ...lastFetchTimes,
        [categoryId]: now
      };
      setLastFetchTimes(updatedFetchTimes);
      Object.assign(globalFetchTimes, updatedFetchTimes);
    } catch (error) {
      console.error(`Error loading ${categoryId} news:`, error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [lastFetchTimes, newsCache]);

  useEffect(() => {
    if (!newsCache[INITIAL_CATEGORY]?.length) {
      loadCategoryNews(INITIAL_CATEGORY, INITIAL_ARTICLES_COUNT);
    }

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadCategoryNews(INITIAL_CATEGORY, INITIAL_ARTICLES_COUNT);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadCategoryNews, newsCache]);

  useEffect(() => {
    if (selectedCategory !== INITIAL_CATEGORY && !newsCache[selectedCategory]?.length) {
      loadCategoryNews(selectedCategory, INITIAL_ARTICLES_COUNT);
    }
  }, [selectedCategory, loadCategoryNews, newsCache]);


  const handleLoadMore = () => {
    const newCount = displayCount + ARTICLES_PER_LOAD;
    setDisplayCount(newCount);
    loadCategoryNews(selectedCategory, newCount);
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const currentArticles = (newsCache[selectedCategory] || []).slice(0, displayCount);
  const hasMore = newsCache[selectedCategory]?.length === displayCount;
  const featuredArticle = currentArticles[0];
  const gridArticles = currentArticles.slice(1);

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Published recently';
    const date = new Date(dateString);
    const hours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'Published just now';
    if (hours === 1) return 'Published 1 hour ago';
    return `Published ${hours} hours ago`;
  };

  return (
    <div className="flex-1 overflow-hidden flex">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-perplexity-accent" />
              <h1 className="text-2xl font-semibold text-perplexity-text">Discover</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedTab('for-you')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                  selectedTab === 'for-you'
                    ? "text-perplexity-accent border-b-2 border-perplexity-accent pb-2"
                    : "text-perplexity-muted hover:text-perplexity-text"
                )}
              >
                <div className="w-4 h-4 rounded-full border-2 border-current"></div>
                <span>For You</span>
              </button>
              <button
                onClick={() => setSelectedTab('top')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                  selectedTab === 'top'
                    ? "text-perplexity-accent border-b-2 border-perplexity-accent pb-2"
                    : "text-perplexity-muted hover:text-perplexity-text"
                )}
              >
                <Star className="w-4 h-4" />
                <span>Top</span>
              </button>
              <button
                onClick={() => setSelectedTab('topics')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                  selectedTab === 'topics'
                    ? "text-perplexity-accent border-b-2 border-perplexity-accent pb-2"
                    : "text-perplexity-muted hover:text-perplexity-text"
                )}
              >
                <List className="w-4 h-4" />
                <span>Topics</span>
                <span className="text-xs">▼</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {isLoading && !currentArticles.length ? (
            <div className="space-y-6">
              <div className="bg-white animate-pulse rounded-lg h-96 border border-gray-100"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <LoadingCards count={6} />
              </div>
            </div>
          ) : (
            <>
              {/* Featured Article */}
              {featuredArticle && (
                <div className="mb-8">
                  <a
                    href={featuredArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all"
                  >
                    <div className="grid md:grid-cols-2 gap-6 p-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-perplexity-muted">
                            {formatTimeAgo(featuredArticle.published_date)}
                          </span>
                        </div>
                        <h2 className="text-2xl font-semibold text-perplexity-text mb-3 group-hover:text-perplexity-accent transition-colors">
                          {featuredArticle.title}
                        </h2>
                        <p className="text-perplexity-text mb-4 leading-relaxed">
                          {featuredArticle.snippet}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-perplexity-muted">
                          <Newspaper className="w-4 h-4" />
                          <span>52 sources</span>
                        </div>
                      </div>
                      {featuredArticle.imageUrl && (
                        <div className="relative aspect-video md:aspect-auto md:h-full overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={featuredArticle.imageUrl}
                            alt={featuredArticle.imageDescription || featuredArticle.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                    </div>
                  </a>
                </div>
              )}

              {/* News Cards Grid */}
              {gridArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gridArticles.map((article: NewsArticle) => (
                    <a
                      key={article.url}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100"
                    >
                      <div className="aspect-video w-full overflow-hidden bg-gray-100">
                        {article.imageUrl ? (
                          <img 
                            src={article.imageUrl} 
                            alt={article.imageDescription || article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-perplexity-muted">
                            <Newspaper className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-perplexity-text group-hover:text-perplexity-accent mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-perplexity-muted mt-3">
                          <Newspaper className="w-3 h-3" />
                          <span>33 sources</span>
                        </div>
                      </div>
                    </a>
                  ))}

                  {isLoadingMore && (
                    <LoadingCards count={ARTICLES_PER_LOAD} />
                  )}
                </div>
              )}

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2 rounded-lg bg-white hover:bg-gray-50 text-perplexity-text border border-gray-200 transition-colors",
                      isLoadingMore && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <span>See More</span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l border-gray-200 overflow-y-auto bg-perplexity-bg">
        <div className="p-6 space-y-6">
          {/* Make it yours Panel */}
          {showMakeItYours && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-perplexity-text mb-1">Make it yours</h3>
                  <p className="text-sm text-perplexity-muted">
                    Select topics and interests to customize your Discover experience
                  </p>
                </div>
                <button
                  onClick={() => setShowMakeItYours(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-perplexity-muted" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {INTEREST_TOPICS.map((topic) => {
                  const isSelected = selectedInterests.includes(topic);
                  return (
                    <button
                      key={topic}
                      onClick={() => toggleInterest(topic)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isSelected
                          ? "bg-perplexity-accent text-white"
                          : "bg-white border border-gray-200 text-perplexity-text hover:bg-gray-50"
                      )}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
              <button className="w-full px-4 py-2 bg-perplexity-accent text-white rounded-lg font-medium hover:bg-perplexity-primary-dark transition-colors">
                Save Interests
              </button>
            </div>
          )}

          {/* Location Widget */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <button className="w-full flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <MapPin className="w-4 h-4 text-perplexity-muted" />
              <span className="text-sm text-perplexity-text">Use precise location</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
