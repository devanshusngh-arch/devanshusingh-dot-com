/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        luxury: {
          bg: '#0a0a0f',
          surface: '#111118',
          border: '#1e1e2e',
          primary: '#f0f0f0',
          muted: '#666680',
          accent: '#3b5ce4',
          'accent-hover': '#5070f0',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
