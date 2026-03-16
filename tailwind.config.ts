import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF4081',
        secondary: '#42A5F5',
        tertiary: '#FFEB3B',
        dark: '#1A1A1A',
        'gray-medium': '#757575',
        'beige-light': '#F5F5F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;