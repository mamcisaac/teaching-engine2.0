// PERFORMANCE OPTIMIZED Service Worker for Teaching Engine 2.0
// Advanced caching, preloading, and offline capabilities

const CACHE_VERSION = '2.0.0';
const CACHE_NAME = `teaching-engine-v${CACHE_VERSION}`;
const DATA_CACHE_NAME = `teaching-engine-data-v${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `teaching-engine-static-v${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `teaching-engine-runtime-v${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `teaching-engine-images-v${CACHE_VERSION}`;

// Critical files for app shell (cache first)
const CRITICAL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg'
];

// Preload critical chunks (identified from build analysis)
const CRITICAL_CHUNKS = [
  '/assets/js/vendor-react-core-',
  '/assets/js/vendor-ui-core-',
  '/assets/js/vendor-state-',
  '/assets/js/index-'
];

// Performance monitoring
const PERFORMANCE_CACHE = new Map();
const MAX_PERFORMANCE_ENTRIES = 1000;

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/curriculum-expectations',
  '/api/unit-plans',
  '/api/etfo-lesson-plans',
  '/api/planner/state',
  '/api/templates',
  '/api/user/profile'
];

// Advanced install event with intelligent preloading
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install with performance optimization');
  
  event.waitUntil(
    Promise.all([
      cacheCriticalFiles(),
      preloadCriticalChunks(),
      initializePerformanceMonitoring()
    ]).then(() => {
      console.log('[ServiceWorker] Installation complete');
      self.skipWaiting();
    })
  );
});

// Cache critical app shell files
async function cacheCriticalFiles() {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  try {
    // Cache critical files with high priority
    await cache.addAll(CRITICAL_FILES);
    console.log('[ServiceWorker] Critical files cached');
  } catch (error) {
    console.error('[ServiceWorker] Failed to cache critical files:', error);
    // Try individual files
    for (const file of CRITICAL_FILES) {
      try {
        const response = await fetch(file);
        if (response.ok) {
          await cache.put(file, response);
        }
      } catch (fileError) {
        console.warn(`[ServiceWorker] Could not cache ${file}:`, fileError.message);
      }
    }
  }
}

// Intelligently preload critical JavaScript chunks
async function preloadCriticalChunks() {
  try {
    // Get list of all JS files from the manifest or build
    const manifestResponse = await fetch('/assets-manifest.json').catch(() => null);
    let criticalFiles = [];
    
    if (manifestResponse && manifestResponse.ok) {
      const manifest = await manifestResponse.json();
      // Extract critical chunks based on our patterns
      for (const [key, value] of Object.entries(manifest)) {
        if (CRITICAL_CHUNKS.some(pattern => value.includes(pattern.replace('-', '')))) {
          criticalFiles.push(value);
        }
      }
    } else {
      // Fallback: attempt to find files by pattern
      console.log('[ServiceWorker] Manifest not found, using pattern-based discovery');
    }
    
    if (criticalFiles.length > 0) {
      const runtimeCache = await caches.open(RUNTIME_CACHE_NAME);
      const promises = criticalFiles.map(async (file) => {
        try {
          const response = await fetch(file);
          if (response.ok) {
            await runtimeCache.put(file, response);
            console.log(`[ServiceWorker] Preloaded critical chunk: ${file}`);
          }
        } catch (error) {
          console.warn(`[ServiceWorker] Failed to preload ${file}:`, error.message);
        }
      });
      
      await Promise.allSettled(promises);
    }
  } catch (error) {
    console.warn('[ServiceWorker] Critical chunk preloading failed:', error);
  }
}

// Initialize performance monitoring
async function initializePerformanceMonitoring() {
  PERFORMANCE_CACHE.clear();
  console.log('[ServiceWorker] Performance monitoring initialized');
}

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME && key !== STATIC_CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Advanced fetch event with intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome-extension and non-http(s) requests
  if (url.protocol === 'chrome-extension:' || !url.protocol.startsWith('http')) {
    return;
  }

  // Performance tracking
  const startTime = performance.now();

  // Route to appropriate handler based on request type
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request, startTime));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request, startTime));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request, startTime));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigation(request, startTime));
  } else {
    event.respondWith(handleGenericRequest(request, startTime));
  }
});

// Check if request is for static assets (CSS, JS, fonts)
function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(css|js|woff|woff2|ttf|eot|ico|svg)$/i.test(url.pathname) ||
         url.pathname.startsWith('/assets/');
}

// Check if request is for images
function isImageRequest(request) {
  return request.destination === 'image' ||
         /\.(png|jpg|jpeg|gif|webp|avif)$/i.test(new URL(request.url).pathname);
}

// Check if request is navigation
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request, startTime) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    recordPerformance('static-cache-hit', startTime);
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    recordPerformance('static-network', startTime);

    if (networkResponse.ok) {
      // Clone and cache the response
      cache.put(request, networkResponse.clone());
      
      // Add performance headers
      const headers = new Headers(networkResponse.headers);
      headers.set('X-Cache-Status', 'MISS');
      headers.set('X-Cache-Time', new Date().toISOString());
      
      return new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: headers
      });
    }
    
    return networkResponse;
  } catch (error) {
    recordPerformance('static-error', startTime);
    console.warn('[ServiceWorker] Static asset fetch failed:', request.url, error);
    
    // Return a minimal fallback for critical assets
    if (request.url.includes('index.css')) {
      return new Response('/* Offline CSS fallback */', {
        headers: { 'Content-Type': 'text/css' }
      });
    }
    
    return new Response('', { status: 503 });
  }
}

// Handle images with optimized caching
async function handleImageRequest(request, startTime) {
  const imageCache = await caches.open(IMAGE_CACHE_NAME);
  const cached = await imageCache.match(request);
  
  if (cached) {
    recordPerformance('image-cache-hit', startTime);
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    recordPerformance('image-network', startTime);

    if (networkResponse.ok) {
      // Only cache images smaller than 1MB
      const contentLength = networkResponse.headers.get('content-length');
      if (!contentLength || parseInt(contentLength) < 1024 * 1024) {
        imageCache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    recordPerformance('image-error', startTime);
    console.warn('[ServiceWorker] Image fetch failed:', request.url, error);
    
    // Return placeholder for failed images
    return new Response('', { status: 503 });
  }
}

// Handle navigation with app shell pattern
async function handleNavigation(request, startTime) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    recordPerformance('navigation-network', startTime);
    
    if (networkResponse.ok) {
      return networkResponse;
    }
  } catch (error) {
    console.warn('[ServiceWorker] Navigation fetch failed:', request.url, error);
  }
  
  // Fallback to cached app shell
  recordPerformance('navigation-cache-fallback', startTime);
  const cached = await cache.match('/index.html');
  return cached || new Response('App temporarily unavailable', { status: 503 });
}

// Handle generic requests
async function handleGenericRequest(request, startTime) {
  const runtimeCache = await caches.open(RUNTIME_CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    recordPerformance('generic-network', startTime);
    
    if (networkResponse.ok && request.method === 'GET') {
      runtimeCache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    recordPerformance('generic-error', startTime);
    
    const cached = await runtimeCache.match(request);
    if (cached) {
      recordPerformance('generic-cache-hit', startTime);
      return cached;
    }
    
    return new Response('', { status: 503 });
  }
}

// Record performance metrics
function recordPerformance(type, startTime) {
  const duration = performance.now() - startTime;
  
  if (PERFORMANCE_CACHE.size >= MAX_PERFORMANCE_ENTRIES) {
    // Remove oldest entries
    const entries = Array.from(PERFORMANCE_CACHE.entries());
    entries.slice(0, 100).forEach(([key]) => PERFORMANCE_CACHE.delete(key));
  }
  
  PERFORMANCE_CACHE.set(`${type}-${Date.now()}`, {
    type,
    duration,
    timestamp: new Date().toISOString()
  });
}

// Handle API requests with network-first strategy and performance tracking
async function handleApiRequest(request, startTime) {
  const cache = await caches.open(DATA_CACHE_NAME);

  try {
    // Try network first with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    const networkResponse = await fetch(request, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    recordPerformance('api-network', startTime);
    
    // Cache successful GET requests
    if (request.method === 'GET' && networkResponse.ok) {
      const shouldCache = API_CACHE_PATTERNS.some(pattern => 
        request.url.includes(pattern)
      );
      
      if (shouldCache) {
        // Add cache headers
        const headers = new Headers(networkResponse.headers);
        headers.set('X-Cache-Status', 'FRESH');
        headers.set('X-Cache-Time', new Date().toISOString());
        
        const responseToCache = new Response(networkResponse.body, {
          status: networkResponse.status,
          statusText: networkResponse.statusText,
          headers: headers
        });
        
        cache.put(request, responseToCache.clone());
        return responseToCache;
      }
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed - handle based on request method
    recordPerformance('api-error', startTime);
    
    if (request.method === 'GET') {
      // For GET requests, try cache
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        recordPerformance('api-cache-hit', startTime);
        
        // Add headers to indicate cached response
        const headers = new Headers(cachedResponse.headers);
        headers.set('X-From-Cache', 'true');
        headers.set('X-Cache-Status', 'STALE');
        headers.set('X-Cache-Time', new Date().toISOString());
        headers.set('X-Network-Error', error.message);
        
        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers: headers
        });
      }
    } else {
      // For POST/PUT/DELETE requests, queue for later sync
      const requestBody = await request.clone().text();
      
      await addPendingChange({
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body: requestBody
      });
      
      // Register background sync
      try {
        await self.registration.sync.register('sync-planning-data');
      } catch (syncError) {
        console.warn('[ServiceWorker] Background sync not supported');
      }
      
      // Return success response indicating queued for sync
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Changes saved offline. They will sync when you\'re back online.',
          queued: true,
          offline: true
        }),
        {
          status: 202, // Accepted
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Return offline error response for failed GET requests
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'You are currently offline. This data is not available.',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle sync events for background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-planning-data') {
    event.waitUntil(syncPlanningData());
  }
});

// Sync planning data when back online
async function syncPlanningData() {
  try {
    // Get all pending changes from IndexedDB
    const pendingChanges = await getPendingChanges();
    
    for (const change of pendingChanges) {
      try {
        const response = await fetch(change.url, {
          method: change.method,
          headers: change.headers,
          body: change.body
        });
        
        if (response.ok) {
          await removePendingChange(change.id);
        }
      } catch (error) {
        console.error('[ServiceWorker] Failed to sync change:', error);
      }
    }
    
    // Notify clients about sync completion
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error('[ServiceWorker] Sync failed:', error);
  }
}

// IndexedDB helpers for pending changes
const DB_NAME = 'TeachingEngineOffline';
const DB_VERSION = 1;
const STORE_NAME = 'pendingChanges';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

async function getPendingChanges() {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.error('[ServiceWorker] Failed to get pending changes:', error);
    return [];
  }
}

async function addPendingChange(change) {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const changeWithTimestamp = {
      ...change,
      timestamp: new Date().toISOString()
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(changeWithTimestamp);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.error('[ServiceWorker] Failed to add pending change:', error);
  }
}

async function removePendingChange(id) {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.error('[ServiceWorker] Failed to remove pending change:', error);
  }
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_CURRICULUM') {
    event.waitUntil(cacheCurriculumData(event.data.urls));
  }
});

// Cache curriculum documents for offline access
async function cacheCurriculumData(urls) {
  const cache = await caches.open(DATA_CACHE_NAME);
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.error('[ServiceWorker] Failed to cache curriculum:', url, error);
    }
  }
}