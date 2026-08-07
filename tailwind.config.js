/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Inter Tight"', 'Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        ink: '#0A0A09',
        paper: '#EDEDE8',
        signal: '#FF4D00',
      },
    },
  },
  plugins: [],
};
