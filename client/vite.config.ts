// PERFORMANCE OPTIMIZED Vite configuration for Teaching Engine 2.0
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// Advanced chunk splitting strategy for optimal loading
function manualChunks(id: string) {
  if (id.includes('node_modules')) {
    // Core React ecosystem - minimal core dependencies
    if (id.includes('react/') || id.includes('react-dom/')) {
      return 'vendor-react-core';
    }
    
    // React Router - separate for better caching
    if (id.includes('react-router')) {
      return 'vendor-router';
    }

    // Critical UI libraries - heavily used components
    if (id.includes('@radix-ui') || id.includes('lucide-react') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) {
      return 'vendor-ui-core';
    }

    // State management - essential for app functionality
    if (id.includes('@tanstack/react-query') || id.includes('zustand') || id.includes('immer')) {
      return 'vendor-state';
    }

    // Network & utilities - frequently used
    if (id.includes('axios') || id.includes('date-fns') || id.includes('nanoid')) {
      return 'vendor-utils-core';
    }

    // Chart libraries - large, separate loading
    if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
      return 'vendor-charts-chartjs';
    }
    if (id.includes('recharts')) {
      return 'vendor-charts-recharts';
    }

    // Calendar - large feature chunk
    if (id.includes('react-big-calendar') || id.includes('moment')) {
      return 'vendor-calendar';
    }

    // Animation - optional enhancement
    if (id.includes('framer-motion')) {
      return 'vendor-animation';
    }

    // PDF generation - heavy feature
    if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('react-to-print')) {
      return 'vendor-pdf';
    }

    // Drag and drop - specific feature
    if (id.includes('@dnd-kit')) {
      return 'vendor-dnd';
    }

    // Form handling - commonly used
    if (id.includes('react-hook-form') || id.includes('zod')) {
      return 'vendor-forms';
    }

    // File handling & security
    if (id.includes('react-dropzone') || id.includes('dompurify')) {
      return 'vendor-files';
    }

    // Monitoring & error tracking - lazy loaded
    if (id.includes('@sentry/')) {
      return 'vendor-monitoring';
    }

    // Toast notifications - lightweight
    if (id.includes('sonner')) {
      return 'vendor-ui-toast';
    }

    // All other vendor dependencies
    return 'vendor-misc';
  }

  // Application code splitting
  if (id.includes('/src/')) {
    // Page components - route-based splitting
    if (id.includes('/pages/')) {
      if (id.includes('ETFOLessonPlan')) return 'page-etfo-lesson';
      if (id.includes('UnitPlans')) return 'page-unit-plans';
      if (id.includes('Calendar')) return 'page-calendar';
      if (id.includes('Newsletter')) return 'page-newsletter';
      if (id.includes('Templates')) return 'page-templates';
      if (id.includes('Help')) return 'page-help';
      return 'pages-misc';
    }

    // Component chunks by feature
    if (id.includes('/components/')) {
      if (id.includes('/ai/')) return 'components-ai';
      if (id.includes('/calendar/')) return 'components-calendar';
      if (id.includes('/planning/')) return 'components-planning';
      if (id.includes('/templates/')) return 'components-templates';
      if (id.includes('/printing/')) return 'components-printing';
      if (id.includes('/performance/')) return 'components-performance';
      if (id.includes('/onboarding/')) return 'components-onboarding';
      return 'components-common';
    }

    // API and services
    if (id.includes('/api/') || id.includes('/services/')) {
      return 'services-api';
    }

    // Stores and state
    if (id.includes('/stores/') || id.includes('/hooks/')) {
      return 'state-management';
    }

    // Utilities
    if (id.includes('/utils/')) {
      return 'app-utils';
    }
  }
  
  // Default fallback for any other files
  return undefined;
}

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const isProd = mode === 'production';

  return {
    plugins: [
      react({
        // Use automatic JSX runtime
        jsxRuntime: 'automatic',
        // Keep minimal Babel configuration to avoid parser errors
        babel: {
          // Don't disable all plugins, use default behavior
          babelrc: false,
          configFile: false,
        },
        // Fast refresh is enabled by default in current plugin version
      }),

      // Advanced bundle analyzer
      isProd && visualizer({
        open: false,
        filename: 'dist/bundle-analysis.html',
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // Better visualization
      }),
    ].filter(Boolean),

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        // Optimize moment.js
        'moment': 'date-fns',
      },
      // Reduce resolution work
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      // Optimize dependency resolution
      dedupe: ['react', 'react-dom', '@tanstack/react-query'],
    },

    envPrefix: 'VITE_',

    server: {
      port: 5173,
      strictPort: true,
      host: true, // Enable network access
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
      // Optimize HMR performance
      hmr: {
        overlay: false,
        clientPort: 5173,
      },
      // Warming up frequently used files
      warmup: {
        clientFiles: [
          './src/main.tsx',
          './src/App.tsx',
          './src/components/ui/**/*.tsx',
          './src/pages/PlanningDashboard.tsx'
        ],
      },
    },

    preview: {
      port: 5173,
      strictPort: true,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },

    build: {
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
      minify: isProd ? 'esbuild' : false,

      // Enable source maps only when needed
      sourcemap: isDev ? 'inline' : false,

      // Advanced chunk optimization
      rollupOptions: {
        output: {
          manualChunks,
          
          // Optimized asset naming strategy
          assetFileNames: (assetInfo) => {
            const info = (assetInfo.name ?? 'asset').split('.');
            let extType = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              extType = 'img';
            } else if (/woff|woff2|eot|ttf|otf/i.test(extType)) {
              extType = 'fonts';
            }
            return `assets/${extType}/[name]-[hash:8][extname]`;
          },
          chunkFileNames: 'assets/js/[name]-[hash:8].js',
          entryFileNames: 'assets/js/[name]-[hash:8].js',

          // Optimize chunk loading
          experimentalMinChunkSize: 1000, // Minimum 1KB chunks
        },

        // External dependencies optimization
        external: (id) => {
          // Don't externalize any dependencies - bundle them
          return false;
        },

        // Tree shaking optimization
        treeshake: {
          preset: 'recommended',
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          unknownGlobalSideEffects: false,
        },
      },

      // Strict chunk size limits
      chunkSizeWarningLimit: 500, // 500KB warning

      // CSS optimization
      cssCodeSplit: true,
      cssMinify: isProd ? 'esbuild' : false,

      // Performance settings
      reportCompressedSize: false, // Faster builds
      assetsInlineLimit: 8192, // 8KB inline limit

      // Advanced module preloading
      modulePreload: {
        polyfill: true,
        resolveDependencies: (url, deps, context) => {
          // Only preload critical dependencies
          return deps.filter(dep => 
            dep.includes('vendor-react-core') || 
            dep.includes('vendor-ui-core') || 
            dep.includes('vendor-state')
          );
        },
      },

      // ESBuild handles minification when minify: 'esbuild' is set
      // Console/debugger removal is handled in the esbuild section below
    },

    // Advanced dependency optimization
    optimizeDeps: {
      // Critical dependencies to pre-bundle
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-router-dom',
        '@tanstack/react-query',
        'axios',
        'date-fns',
        'zustand',
        'immer',
        'clsx',
        'tailwind-merge',
        'lucide-react',
        'nanoid',
        'sonner',
      ],
      
      // Exclude local packages and problematic deps
      exclude: [
        '@teaching-engine/database',
        'framer-motion', // Load lazily for animations
      ],

      // ESBuild options for dependency optimization
      esbuildOptions: {
        target: 'es2020',
        jsx: 'automatic',
        supported: {
          bigint: true,
        },
      },

      // Force optimization for consistency
      force: isDev,
    },

    // Cache configuration for maximum performance
    cacheDir: 'node_modules/.vite',

    // Advanced ESBuild configuration
    esbuild: {
      target: 'es2020',
      legalComments: 'none',
      treeShaking: true,
      // Configure JSX for automatic runtime
      jsx: 'automatic',
      jsxDev: isDev,
      
      // Production optimizations
      ...(isProd && {
        drop: ['console', 'debugger'],
        minifyIdentifiers: true,
        minifySyntax: true,
        minifyWhitespace: true,
      }),

      // Development optimizations
      ...(isDev && {
        sourcemap: 'inline',
        keepNames: true,
      }),
    },

    // Web Worker optimization
    worker: {
      format: 'es',
      plugins: () => [react()],
      rollupOptions: {
        output: {
          entryFileNames: 'assets/worker/[name]-[hash:8].js',
          chunkFileNames: 'assets/worker/chunk-[name]-[hash:8].js',
        },
      },
    },

    // Prevent dependency cycles and optimize loading
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      __DEV__: isDev,
    },

    // JSON optimization
    json: {
      stringify: true,
    },

    // Experimental features for performance
    experimental: {
      renderBuiltUrl: (filename) => {
        return `/${filename}`;
      },
    },
  };
});
