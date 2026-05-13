/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'portfolio-bg': '#0f1a2e',
        'portfolio-surface': '#18243d',
        'portfolio-mid': '#344060',
        'portfolio-accent': '#3b5ce4',
        'portfolio-muted': '#6475a0',
        'portfolio-white': '#ffffff',
        'portfolio-rule': '#d0d5e8',
      },
      fontFamily: {
        'display': ['"Instrument Serif"', 'serif'],
        'body': ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        'portfolio': '16px',
      },
      backgroundImage: {
        'signature-gradient': 'linear-gradient(180deg, #21c4d8 0%, #eea943 25%, #0598d3 50%, #c23764 75%, #843590 100%)',
      },
      borderWidth: {
        'portfolio': '0.5px',
      },
      borderColor: {
        'portfolio-card': '#dce3f4',
      }
    },
  },
  plugins: [],
}
