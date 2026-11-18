import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Builds one self-contained index.html, so the preview can be hosted anywhere.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
});
