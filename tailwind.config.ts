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
        primary: '#3D7A35',
        'primary-dark': '#2D5A27',
        'primary-light': '#7FB069',
        surface: '#F5F5F5',
        muted: '#888888',
        'alert-red': '#E53E3E',
        'alert-orange': '#DD6B20',
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
