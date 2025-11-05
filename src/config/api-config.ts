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