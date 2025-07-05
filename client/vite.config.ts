import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          
          // UI libraries
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-select', 
                        '@radix-ui/react-checkbox', '@radix-ui/react-progress', 'lucide-react'],
          
          // State management
          'vendor-state': ['@tanstack/react-query', 'zustand', 'immer'],
          
          // Utils
          'vendor-utils': ['axios', 'date-fns', 'clsx', 'zod'],
          
          // Heavy libraries - separate chunks
          'vendor-calendar': ['react-big-calendar', 'moment'],
          'vendor-charts': ['recharts', 'chart.js', 'react-chartjs-2'],
          'vendor-animation': ['framer-motion'],
          'vendor-pdf': ['jspdf', 'html2canvas'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable'],
          'vendor-forms': ['react-hook-form', 'react-dropzone'],
          
          // Sanitization
          'vendor-sanitize': ['dompurify'],
        },
      },
    },
    chunkSizeWarningLimit: 300,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
    ],
  },
});