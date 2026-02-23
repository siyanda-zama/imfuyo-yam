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
        primary: { DEFAULT: '#00C896', dark: '#00A87E', light: '#33D4AB' },
        background: '#0A1628',
        surface: { DEFAULT: '#0F1F35', light: '#162D4A' },
        border: '#1E3A5F',
        'text-primary': '#FFFFFF',
        'text-secondary': '#8899AA',
        'text-muted': '#556677',
        success: '#00C896',
        warning: '#FFB020',
        danger: '#FF4757',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      maxWidth: {
        app: '430px',
      },
    },
  },
  plugins: [],
};
export default config;
