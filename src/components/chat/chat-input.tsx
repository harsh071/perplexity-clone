import { useState, useRef, useEffect } from 'react';
import { Send, StopCircle, Paperclip, Globe, Search, Shuffle, HelpCircle, Mic, Cpu } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSearchStore } from '../../store/search-store';
import mixpanel from 'mixpanel-browser';
import { ENABLE_ANALYTICS } from '../../config/api-config';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
];

interface ChatInputProps {
  onSubmit: (content: string, language: string) => void;
  disabled?: boolean;
  isFollowUp?: boolean;
  onStop?: () => void;
  isNewThread?: boolean;
}

export function ChatInput({
  onSubmit,
  disabled = false,
  isFollowUp = false,
  onStop,
  isNewThread = false
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  
  const selectedLanguage = useSearchStore(state => state.selectedLanguage);
  const setSelectedLanguage = useSearchStore(state => state.setSelectedLanguage);
  const isProMode = useSearchStore(state => state.isProMode);
  const toggleProMode = useSearchStore(state => state.toggleProMode);

  useEffect(() => {
    if (isNewThread && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isNewThread]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim(), selectedLanguage);
      setInput('');
    }
  };

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code);
    setShowLanguageMenu(false);
    if (ENABLE_ANALYTICS) {
      mixpanel.track('Language Changed', {
        from: selectedLanguage,
        to: code,
        timestamp: new Date().toISOString()
      });
    }
  };

  const selectedLang = LANGUAGES.find(lang => lang.code === selectedLanguage);

  const handleVoiceToggle = () => {
    setIsVoiceActive(!isVoiceActive);
    // TODO: Implement voice input functionality
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center bg-white border border-gray-200 rounded-full px-4 py-3">
        {/* Left Side Icons */}
        <div className="flex items-center gap-2 mr-3">
          {/* Search Button - Active */}
          <button
            type="button"
            className={cn(
              "p-1.5 rounded-md border transition-all",
              "bg-perplexity-accent/10 border-perplexity-accent text-perplexity-accent"
            )}
            aria-label="Search mode"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Shuffle Button */}
          <button
            type="button"
            className="p-1.5 text-perplexity-muted hover:text-perplexity-text transition-colors"
            aria-label="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Separator */}
          <div className="w-px h-4 bg-gray-300 mx-1" />

          {/* Help Button */}
          <button
            type="button"
            className="p-1.5 text-perplexity-muted hover:text-perplexity-text transition-colors"
            aria-label="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything. Type @ for mentions."
          className={cn(
            "flex-1 bg-transparent outline-none text-perplexity-text",
            "placeholder:text-perplexity-muted",
            "pr-4",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        />

        {/* Right Side Icons */}
        <div className="flex items-center gap-2 ml-3">
          {/* Language Selector */}
          <div className="relative" ref={languageMenuRef}>
            <button
              type="button"
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="p-1.5 text-perplexity-muted hover:text-perplexity-text transition-colors"
              aria-label="Language"
            >
              <Globe className="w-4 h-4" />
            </button>
            
            {showLanguageMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={cn(
                      "w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-perplexity-card transition-colors",
                      lang.code === selectedLanguage ? "text-perplexity-accent" : "text-perplexity-text"
                    )}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-sm">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stop Button (when loading) */}
          {disabled && onStop && (
            <button
              type="button"
              onClick={onStop}
              className="p-1.5 text-perplexity-accent hover:text-perplexity-accent/80 transition-colors"
              aria-label="Stop"
            >
              <StopCircle className="w-4 h-4" />
            </button>
          )}

          {/* Send Button */}
          {!disabled && (
            <button
              type="submit"
              disabled={!input.trim()}
              className={cn(
                "p-1.5 text-perplexity-accent hover:text-perplexity-accent/80 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}