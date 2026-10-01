// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  vite: {
    // Process font CSS through Vite instead of loading it directly in Node.
    resolve: {
      noExternal: [/^@fontsource\//]
    },
    plugins: [tailwindcss()]
  },

  integrations: [react()]
});
