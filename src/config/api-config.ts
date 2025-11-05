import mixpanel from 'mixpanel-browser';

// Analytics API Key (client-side is fine for Mixpanel)
export const MIXPANEL_TOKEN = import.meta.env.VITE_MIXED_PANEL_API_KEY;

// Initialize Mixpanel
if (MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV === 'development',
    track_pageview: true,
    persistence: 'localStorage'
  });
  console.info('Mixpanel initialized');
} else {
  console.warn('VITE_MIXED_PANEL_API_KEY is not set in environment variables. Analytics will be disabled.');
}

// Model Configuration
export const DEFAULT_MODEL = 'gpt-4o-mini';
export const STREAM_ENABLED = true;

// Rate Limiting and Performance
export const UPDATE_INTERVAL = 50; // ms between UI updates

// Feature Flags
export const ENABLE_WEB_SEARCH = true; // Always enabled, handled by server
export const ENABLE_ANALYTICS = Boolean(MIXPANEL_TOKEN);

// Mock Mode - Enable to use mock services instead of real APIs
// Set VITE_USE_MOCK_MODE=true in your .env file to enable mock mode
export const USE_MOCK_MODE = import.meta.env.VITE_USE_MOCK_MODE === 'true' || import.meta.env.VITE_USE_MOCK_MODE === '1';

// Auto Fallback - Transparently use mock data when real APIs fail in prod
// Enabled by default (set VITE_AUTO_FALLBACK_TO_MOCK=false to disable)
export const AUTO_FALLBACK_TO_MOCK = (
  import.meta.env.VITE_AUTO_FALLBACK_TO_MOCK === undefined ||
  import.meta.env.VITE_AUTO_FALLBACK_TO_MOCK === 'true' ||
  import.meta.env.VITE_AUTO_FALLBACK_TO_MOCK === '1'
);

// Log mock mode status
if (USE_MOCK_MODE) {
  console.log('%c🎭 Mock Mode Enabled', 'color: #10b981; font-weight: bold; font-size: 14px;');
  console.log('All API calls will use mock data. No API keys required.');
} 