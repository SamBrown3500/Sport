import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { site } from './src/site';

// Builds one self-contained index.html, so the preview can be hosted anywhere.
export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    // Fills %SITE_NAME% in index.html from src/site.ts.
    { name: 'site-name', transformIndexHtml: (html) => html.replaceAll('%SITE_NAME%', site.name) },
  ],
});
