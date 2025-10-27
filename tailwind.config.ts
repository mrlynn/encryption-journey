import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // MongoDB palette
        primary: "#00ED64",
        dark: "#001E2B", 
        accent: "#00684A",
        neutral: "#C1BEBC",
        // Additional colors for the visualizer
        'mongo-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#00ED64', // Primary MongoDB green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'mongo-dark': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#001E2B', // Primary dark
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'flow-dot': 'flow-dot 3s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(0, 237, 100, 0.5)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(0, 237, 100, 0.8)',
            transform: 'scale(1.05)'
          },
        },
        'flow-dot': {
          '0%': { offsetDistance: '0%' },
          '100%': { offsetDistance: '100%' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
