import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://nxthyre-server-staging-863630644667.asia-south1.run.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
