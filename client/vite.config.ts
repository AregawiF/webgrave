import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {  // Keep this if you need it, but it's not related to the env issue.
    exclude: ['lucide-react'],
  },
});