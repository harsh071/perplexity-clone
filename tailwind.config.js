/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        'perplexity-bg': '#F8F8F5',
        'perplexity-card': '#F0F0ED',
        'perplexity-hover': '#E8E8E5',
        'perplexity-text': '#1A1A1A',
        'perplexity-muted': '#888888',
        'perplexity-accent': '#2D8B8B',
        'perplexity-primary': '#2D8B8B',
        'perplexity-primary-dark': '#247070',
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'slow-fade-in': 'fade-in 1s ease-in-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    import('@tailwindcss/typography'),
  ],
}