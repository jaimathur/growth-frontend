import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    // Dev: forward /api to the FastAPI server so the browser sees a single origin (no CORS needed).
    proxy: { '/api': 'http://localhost:8000' },
  },
});
