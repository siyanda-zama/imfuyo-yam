import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // HerdGuard dark theme palette
        navy: {
          DEFAULT: '#0F2027',
          light: '#1B3A4B',
          mid: '#153040',
        },
        cyan: {
          DEFAULT: '#00E5CC',
          dark: '#00B8A3',
          light: '#33FFE8',
          glow: 'rgba(0, 229, 204, 0.15)',
        },
        lime: {
          DEFAULT: '#7BF542',
          dark: '#5BC72E',
          light: '#A3FF6E',
          glow: 'rgba(123, 245, 66, 0.15)',
        },
        slate: {
          DEFAULT: '#4A6272',
          light: '#8BA3B5',
          dark: '#2D3E4A',
        },
        surface: {
          DEFAULT: '#122A35',
          card: '#1B3A4B',
          elevated: '#1F4050',
        },
        muted: '#8BA3B5',
        'alert-red': '#FF4757',
        'alert-orange': '#FFA502',
        // Legacy aliases for components
        primary: '#00E5CC',
        'primary-dark': '#00B8A3',
        'primary-light': '#33FFE8',
      },
      fontFamily: {
        heading: ['var(--font-dm-serif)', 'serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
      },
      maxWidth: {
        app: '430px',
      },
    },
  },
  plugins: [],
};
export default config;
