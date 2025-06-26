// Optimized Vite configuration for Teaching Engine 2.0
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

// Custom chunk splitting strategy
function manualChunks(id: string) {
  if (id.includes('node_modules')) {
    // Core React ecosystem
    if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
      return 'vendor-react';
    }
    
    // UI libraries
    if (id.includes('@radix-ui') || id.includes('@headlessui') || id.includes('lucide-react')) {
      return 'vendor-ui';
    }
    
    // Data & state management
    if (id.includes('@tanstack/react-query') || id.includes('zustand') || id.includes('immer')) {
      return 'vendor-data';
    }
    
    // Utilities
    if (id.includes('lodash') || id.includes('date-fns') || id.includes('axios')) {
      return 'vendor-utils';
    }
    
    // Charts & visualization
    if (id.includes('chart.js') || id.includes('recharts')) {
      return 'vendor-charts';
    }
    
    // Form handling
    if (id.includes('react-dropzone') || id.includes('dompurify')) {
      return 'vendor-forms';
    }
  }
}

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const isProd = mode === 'production';
  
  return {
    plugins: [
      react({
        // Optimize React for production
        babel: isProd ? {
          plugins: [
            ['@babel/plugin-transform-react-constant-elements'],
            ['@babel/plugin-transform-react-inline-elements']
          ]
        } : undefined
      }),
      
      // Split vendor chunks intelligently
      splitVendorChunkPlugin(),
      
      // Compress assets in production
      isProd && compression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 10240, // Only compress files > 10KB
      }),
      
      isProd && compression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 10240,
      }),
      
      // Bundle analyzer for production builds
      isProd && process.env.ANALYZE && visualizer({
        open: true,
        filename: 'dist/bundle-analysis.html',
        gzipSize: true,
        brotliSize: true,
      })
    ].filter(Boolean),
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    
    envPrefix: 'VITE_',
    
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
      // Optimize HMR
      hmr: {
        overlay: false, // Reduce overhead
      },
    },
    
    preview: {
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
      minify: isProd ? 'terser' : false,
      
      terserOptions: isProd ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info'],
          passes: 2,
        },
        mangle: {
          safari10: true,
        },
        format: {
          comments: false,
        },
      } : undefined,
      
      // Source maps only in development
      sourcemap: isDev,
      
      // Optimize chunks
      rollupOptions: {
        output: {
          manualChunks,
          // Asset naming for better caching
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            let extType = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              extType = 'img';
            } else if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
              extType = 'fonts';
            }
            return `assets/${extType}/[name]-[hash][extname]`;
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },
      
      // Chunk size warnings
      chunkSizeWarningLimit: 1000, // 1MB
      
      // CSS optimization
      cssCodeSplit: true,
      cssMinify: isProd,
      
      // Build performance
      reportCompressedSize: false, // Faster builds
      
      // Module preload
      modulePreload: {
        polyfill: true,
      },
    },
    
    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'axios',
        'date-fns',
      ],
      exclude: [
        '@teaching-engine/database', // Local package
      ],
      // Force optimization in development for consistency
      force: isDev,
    },
    
    // Cache configuration
    cacheDir: '.vite-cache',
    
    // Performance optimizations
    esbuild: {
      target: 'es2020',
      // Faster JSX transform
      jsxInject: `import React from 'react'`,
      // Remove unused code
      treeShaking: true,
      // Optimize for speed in development
      minifyIdentifiers: isProd,
      minifySyntax: isProd,
      minifyWhitespace: isProd,
    },
    
    // Worker configuration
    worker: {
      format: 'es',
      rollupOptions: {
        output: {
          entryFileNames: 'assets/worker/[name]-[hash].js',
        },
      },
    },
  };
});