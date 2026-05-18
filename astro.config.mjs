import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  server: {
    host: true,
    port: 3000
  },
  integrations: [tailwind(), react()],
});
