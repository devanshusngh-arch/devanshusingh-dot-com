import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://devanshusingh.com',
  output: 'server',
  adapter: cloudflare(),
  server: {
    host: true,
    port: 3000
  },
  integrations: [tailwind(), react(), sitemap()],
});
