import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { 
    extend: {
      screens: {
        '3xl': '1700px',  // Custom breakpoint for 3-column layout
      }
    } 
  },
  plugins: [],
} satisfies Config;
