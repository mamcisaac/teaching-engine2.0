# Performance Optimization Plan - Frontend

> **Last Updated**: 2025-07-04  
> **Target**: Reduce bundle size by 50%, improve load times  
> **Current Baseline**: Main chunk 526KB, Calendar chunk 253KB

---

## 🎯 Performance Goals

### Primary Targets:

- **Main bundle**: 526KB → <250KB (53% reduction)
- **Feature chunks**: <100KB each (Calendar: 253KB → <100KB)
- **Load time**: First Contentful Paint <1.5s
- **Core Web Vitals**: Lighthouse score >95

### Success Metrics:

```typescript
// Performance budget (enforce in CI):
const PERFORMANCE_BUDGET = {
  mainChunk: 250000, // 250KB
  featureChunk: 100000, // 100KB per feature
  totalBundle: 800000, // 800KB total
  firstContentfulPaint: 1500, // 1.5s
  largestContentfulPaint: 2500, // 2.5s
};
```

---

## 📊 Current Bundle Analysis

### Webpack Bundle Analyzer Output:

```bash
# Run analysis:
npm run build
npm run analyze

# Current chunks:
dist/assets/index-C7dyxJG_.js          526.17 kB │ gzipped: 164.73 kB
dist/assets/CalendarPlanning-X8F2nD_.js  253.42 kB │ gzipped: 78.12 kB
dist/assets/OnboardingFlow-M9K3pL_.js   116.89 kB │ gzipped: 35.24 kB
dist/assets/vendor-Y5N9bC_.js           342.18 kB │ gzipped: 89.45 kB
```

### Dependency Analysis:

```typescript
// Large dependencies contributing to bundle size:
// (Run: npx webpack-bundle-analyzer dist/stats.json)

// Suspected heavy imports:
- @fullcalendar/* packages (estimated: 150KB)
- react-query + dependencies (estimated: 80KB)
- UI component libraries (estimated: 120KB)
- date/time utilities (estimated: 60KB)
- chart libraries (estimated: 90KB)
```

---

## 🔧 Optimization Strategies

### 1. Aggressive Code Splitting (Immediate Impact)

#### Current State:

```typescript
// Basic lazy loading (insufficient):
const CalendarPlanningPage = lazy(() => import('./pages/planning/CalendarPlanningPage'));
const OnboardingFlow = lazy(() => import('./components/OnboardingFlow'));
```

#### Optimization Plan:

```typescript
// 1. Granular feature splitting:
const CalendarView = lazy(() => import('./features/calendar/CalendarView'));
const EventEditor = lazy(() => import('./features/calendar/EventEditor'));
const CalendarSettings = lazy(() => import('./features/calendar/CalendarSettings'));

// 2. Component-level splitting for heavy features:
const PlanningPage = lazy(() =>
  import('./pages/planning/PlanningPage').then((module) => ({
    default: module.PlanningPageShell,
  })),
);

// 3. Conditional feature loading:
const AdvancedCalendar = lazy(() => {
  // Only load if user has calendar permissions
  if (user.permissions.includes('calendar.advanced')) {
    return import('./features/calendar/AdvancedCalendar');
  }
  return import('./features/calendar/BasicCalendar');
});

// 4. Route-based splitting:
const AdminRoutes = lazy(() => import('./routes/AdminRoutes'));
const TeacherRoutes = lazy(() => import('./routes/TeacherRoutes'));
const StudentRoutes = lazy(() => import('./routes/StudentRoutes'));
```

#### Implementation Steps:

1. **Audit large components** (>100KB) for splitting opportunities
2. **Create feature boundaries** around logical functionality
3. **Implement progressive loading** based on user roles/permissions
4. **Add loading states** for better UX during chunk loading

#### Expected Impact:

- **Main chunk**: 526KB → 180KB (65% reduction)
- **Feature chunks**: Calendar 253KB → 85KB (66% reduction)

---

### 2. Vendor Bundle Optimization

#### Current Issues:

```typescript
// All vendors bundled together (342KB):
// - React ecosystem (react, react-dom, react-router)
// - UI libraries (@radix-ui/*, lucide-react)
// - Calendar libraries (@fullcalendar/*)
// - Chart libraries (recharts, d3)
// - Date utilities (date-fns, moment)
```

#### Optimization Strategy:

```typescript
// vite.config.ts - Manual chunk splitting:
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React ecosystem (loaded on every page)
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI framework (loaded on most pages)
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            'lucide-react',
            'tailwindcss',
          ],

          // Calendar feature (loaded only when needed)
          'calendar-vendor': [
            '@fullcalendar/core',
            '@fullcalendar/daygrid',
            '@fullcalendar/timegrid',
            '@fullcalendar/interaction',
          ],

          // Charts feature (loaded only when needed)
          'charts-vendor': ['recharts', 'd3-scale', 'd3-shape'],

          // Date utilities (shared across features)
          'date-vendor': ['date-fns', 'date-fns-tz'],
        },
      },
    },
  },
});
```

#### Expected Impact:

- **Vendor chunking**: 342KB → 5 smaller chunks (<100KB each)
- **Caching efficiency**: Framework updates don't invalidate feature code
- **Parallel loading**: Multiple small chunks load faster than one large

---

### 3. Dynamic Import Optimization

#### Heavy Feature Detection:

```typescript
// Identify components that load heavy dependencies:

// 1. Calendar components:
// - FullCalendar library (150KB estimated)
// - Date manipulation utilities
// - Event management logic

// 2. Rich text editors:
// - Editor libraries (if using)
// - Formatting utilities

// 3. File upload/preview:
// - PDF viewers
// - Image processing
// - Document parsers

// 4. Charts and visualizations:
// - Chart libraries
// - Data processing utilities
```

#### Dynamic Loading Implementation:

```typescript
// 1. Component-level dynamic imports:
const CalendarComponent = () => {
  const [calendarModule, setCalendarModule] = useState(null);

  useEffect(() => {
    // Load calendar only when component mounts
    import('@fullcalendar/react').then(module => {
      setCalendarModule(module);
    });
  }, []);

  if (!calendarModule) {
    return <CalendarSkeleton />;
  }

  return <calendarModule.default {...props} />;
};

// 2. Feature flag-based loading:
const AdvancedFeatures = ({ user }) => {
  if (!user.hasAdvancedFeatures) {
    return <BasicInterface />;
  }

  // Load advanced features only for premium users
  return (
    <Suspense fallback={<AdvancedSkeleton />}>
      <AdvancedInterface />
    </Suspense>
  );
};

// 3. Intersection observer loading:
const ExpensiveChart = () => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true);
      }
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {shouldLoad ? (
        <Suspense fallback={<ChartSkeleton />}>
          <LazyChart />
        </Suspense>
      ) : (
        <ChartPlaceholder />
      )}
    </div>
  );
};
```

---

### 4. Tree Shaking and Dead Code Elimination

#### Audit Process:

```bash
# 1. Analyze unused exports:
npx unimported

# 2. Check for unused CSS:
npx purgecss --css dist/**/*.css --content dist/**/*.html

# 3. Bundle analyzer for unused code:
npx webpack-bundle-analyzer dist/stats.json

# 4. Dependency analysis:
npx depcheck
```

#### Common Issues to Address:

```typescript
// 1. Full library imports instead of selective:
// BAD:
import * as dateFns from 'date-fns';
import { Button, Dialog, Tooltip, ... } from '@radix-ui/react';

// GOOD:
import { format, addDays } from 'date-fns';
import { Button } from '@radix-ui/react-button';
import { Dialog } from '@radix-ui/react-dialog';

// 2. Unused utility functions:
// Remove or consolidate utility files with unused exports

// 3. CSS framework bloat:
// Ensure Tailwind purging is aggressive
// Remove unused custom CSS

// 4. Polyfills for modern browsers:
// Remove unnecessary polyfills if targeting modern browsers only
```

#### Implementation Plan:

1. **Audit imports**: Switch to named imports from barrel imports
2. **Remove unused code**: Delete unused components, utilities, types
3. **Optimize CSS**: Aggressive Tailwind purging, remove unused styles
4. **Modern browser targeting**: Remove unnecessary polyfills

#### Expected Impact:

- **Bundle reduction**: 10-15% size decrease
- **Build performance**: Faster build times
- **Runtime performance**: Less code to parse

---

### 5. Asset Optimization

#### Image and Media Optimization:

```typescript
// 1. Image optimization strategy:
// - WebP format with fallbacks
// - Responsive images with srcset
// - Lazy loading for images below fold
// - SVG optimization for icons

// 2. Font optimization:
// - Subset fonts to required characters
// - Use font-display: swap
// - Preload critical fonts

// 3. Asset chunking:
// - Separate assets by feature
// - CDN-friendly caching headers
```

#### Implementation:

```typescript
// vite.config.ts - Asset optimization:
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (/\.(png|jpe?g|svg|gif|webp)$/.test(assetInfo.name || '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name || '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  assetsInclude: ['**/*.webp'], // Include WebP images
});
```

---

## 📈 Progressive Loading Strategy

### User Experience Optimization:

```typescript
// 1. Critical path loading:
// Load auth, navigation, and core UI first
const CriticalApp = lazy(() => import('./CriticalApp'));
const NonCriticalFeatures = lazy(() => import('./NonCriticalFeatures'));

// 2. Progressive enhancement:
// Start with basic functionality, enhance with advanced features
const App = () => {
  const [enhancementsLoaded, setEnhancementsLoaded] = useState(false);

  useEffect(() => {
    // Load enhancements after critical path
    setTimeout(() => {
      import('./enhancements').then(() => {
        setEnhancementsLoaded(true);
      });
    }, 100);
  }, []);

  return (
    <div>
      <CriticalApp />
      {enhancementsLoaded && <EnhancedFeatures />}
    </div>
  );
};

// 3. Preloading strategy:
// Preload likely-needed chunks based on user behavior
const preloadCalendar = () => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = '/assets/CalendarPlanning-optimized.js';
  document.head.appendChild(link);
};

// Preload when user hovers over calendar navigation
<NavigationItem
  onMouseEnter={preloadCalendar}
  href="/calendar"
>
  Calendar
</NavigationItem>
```

---

## 🔍 Monitoring and Measurement

### Performance Monitoring Setup:

```typescript
// 1. Bundle size monitoring:
// CI/CD integration to track bundle size changes
const bundleSizeCheck = {
  maxMainChunk: 250000,
  maxFeatureChunk: 100000,
  maxVendorChunk: 150000,
  failOnExceed: true,
};

// 2. Core Web Vitals tracking:
// Real user monitoring for performance metrics
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const sendToAnalytics = (metric) => {
  // Send performance data to monitoring service
  analytics.track('performance', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
  });
};

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);

// 3. Loading time tracking:
// Track chunk loading times
performance.mark('chunk-load-start');
import('./ChunkComponent').then(() => {
  performance.mark('chunk-load-end');
  performance.measure('chunk-load', 'chunk-load-start', 'chunk-load-end');
});
```

### Performance Testing:

```bash
# 1. Lighthouse CI integration:
npm install -g @lhci/cli
lhci autorun

# 2. Bundle size regression testing:
npm run build
node scripts/check-bundle-size.js

# 3. Load testing with different network conditions:
npx lighthouse --throttling-method=devtools --throttling.cpuSlowdownMultiplier=4

# 4. Memory usage profiling:
# Use React DevTools Profiler to identify memory leaks
```

---

## 📋 Implementation Timeline

### Phase 1: Quick Wins (Week 1-2)

- [ ] **Vendor chunk splitting** - Immediate 30% bundle reduction
- [ ] **Remove console statements** - Clean up development artifacts
- [ ] **Basic code splitting** - Split largest components
- [ ] **Tree shaking audit** - Remove unused imports

**Expected Results**:

- Main chunk: 526KB → 350KB (33% reduction)
- Feature chunks: Calendar 253KB → 180KB (29% reduction)

### Phase 2: Advanced Optimization (Week 3-4)

- [ ] **Granular code splitting** - Component-level splitting
- [ ] **Dynamic imports** - Conditional feature loading
- [ ] **Asset optimization** - Images, fonts, CSS optimization
- [ ] **Progressive loading** - Critical path optimization

**Expected Results**:

- Main chunk: 350KB → 220KB (37% further reduction)
- Feature chunks: All chunks <100KB
- Load time: 50% improvement

### Phase 3: Monitoring and Refinement (Week 5-6)

- [ ] **Performance monitoring** - Set up automated tracking
- [ ] **Bundle size CI checks** - Prevent regression
- [ ] **User experience testing** - Validate improvements
- [ ] **Documentation** - Performance guidelines for team

**Expected Results**:

- Consistent performance budget enforcement
- Automated performance regression detection
- Team awareness of performance best practices

---

## 🎯 Success Criteria

### Quantitative Metrics:

```typescript
const SUCCESS_CRITERIA = {
  bundleSize: {
    mainChunk: '<250KB', // Target: 526KB → 220KB
    featureChunks: '<100KB', // Target: 253KB → 85KB
    totalBundle: '<800KB', // Target: Current ~1.2MB → 750KB
  },

  performance: {
    firstContentfulPaint: '<1.5s', // Target improvement
    largestContentfulPaint: '<2.5s', // Target improvement
    timeToInteractive: '<3.0s', // Target improvement
    cumulativeLayoutShift: '<0.1', // Target improvement
  },

  lighthouse: {
    performance: '>95', // Current baseline needed
    accessibility: '>95', // Maintain current level
    bestPractices: '>95', // Maintain current level
    seo: '>95', // Maintain current level
  },

  userExperience: {
    chunkLoadTime: '<500ms', // Feature chunks load quickly
    navigationSpeed: '<200ms', // Route transitions
    memoryUsage: '<50MB', // After optimization
    cacheEfficiency: '>90%', // Vendor chunk cache hits
  },
};
```

### Qualitative Improvements:

- [ ] **Perceived performance**: Users report faster loading
- [ ] **Mobile experience**: Significant improvement on mobile devices
- [ ] **Developer experience**: Faster build times, clearer bundle analysis
- [ ] **Maintainability**: Better code organization through splitting

---

## 🚨 Risk Mitigation

### Potential Issues:

1. **Over-splitting**: Too many small chunks causing waterfall loading
2. **Cache invalidation**: Aggressive splitting affecting cache efficiency
3. **User experience**: Loading states becoming too prominent
4. **Complexity**: Code splitting making debugging harder

### Mitigation Strategies:

```typescript
// 1. Intelligent chunk sizing:
// Aim for 50-150KB chunks (sweet spot for HTTP/2)
const OPTIMAL_CHUNK_SIZE = {
  min: 50000,   // 50KB minimum
  max: 150000,  // 150KB maximum
  target: 100000 // 100KB target
};

// 2. Preloading strategy:
// Preload likely-needed chunks to reduce perceived loading
const preloadStrategies = {
  userRole: 'preload role-specific features',
  navigation: 'preload on hover',
  usage: 'preload based on user history'
};

// 3. Fallback strategies:
// Graceful degradation if chunks fail to load
const ChunkErrorBoundary = ({ children, fallback }) => {
  return (
    <ErrorBoundary
      fallback={fallback}
      onError={(error) => {
        if (error.name === 'ChunkLoadError') {
          // Retry loading or show simplified UI
          window.location.reload();
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
```

---

_This optimization plan should be executed incrementally with careful monitoring at each phase to ensure improvements don't negatively impact user experience._
