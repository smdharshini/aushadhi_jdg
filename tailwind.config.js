/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#F6F3EC',
          paper: '#FFFFFF',
          subtle: '#FBF9F5',
          muted: '#EFECE4',
        },
        ink: {
          DEFAULT: '#14211C',
          light: '#2E3D36',
          muted: '#52635B',
          faint: '#85968E',
        },
        teal: {
          DEFAULT: '#0F5C4D',
          hover: '#0C4A3E',
          active: '#08382F',
          subtle: '#E8F3F0',
          border: '#A7CCC4',
        },
        warning: {
          DEFAULT: '#D9822B',
          subtle: '#FDF3E7',
          border: '#E8B682',
        },
        critical: {
          DEFAULT: '#B3261E',
          subtle: '#FCEBEA',
          border: '#E6A5A1',
        },
        success: {
          DEFAULT: '#1E6B38',
          subtle: '#E9F5ED',
          border: '#A3D4B3',
        },
        line: {
          DEFAULT: '#E2DDD2',
          strong: '#D4CEBF',
          dark: '#B0A99A',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Newsreader', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        md: '6px',
        lg: '6px',
      },
    },
  },
  plugins: [],
}
