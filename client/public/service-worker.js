// Service Worker for Teaching Engine 2.0
// Provides offline capabilities and performance optimizations

const CACHE_NAME = 'teaching-engine-v1';
const DATA_CACHE_NAME = 'teaching-engine-data-v1';
const STATIC_CACHE_NAME = 'teaching-engine-static-v1';

// Files to cache for offline use (production-ready paths)
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/index.css', // Production CSS bundle
  '/vite.svg',
  '/favicon.ico'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/curriculum-expectations',
  '/api/unit-plans',
  '/api/etfo-lesson-plans',
  '/api/planner/state',
  '/api/templates',
  '/api/user/profile'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(async (cache) => {
      console.log('[ServiceWorker] Caching static files');
      
      // Cache essential files first
      const essentialFiles = ['/', '/index.html', '/manifest.json'];
      
      try {
        await cache.addAll(essentialFiles);
        console.log('[ServiceWorker] Essential files cached');
        
        // Try to cache additional files, but don't fail if they don't exist
        for (const file of STATIC_FILES.slice(3)) {
          try {
            const response = await fetch(file);
            if (response.ok) {
              await cache.put(file, response);
            }
          } catch (error) {
            console.warn(`[ServiceWorker] Could not cache ${file}:`, error.message);
          }
        }
      } catch (error) {
        console.error('[ServiceWorker] Failed to cache essential files:', error);
      }
    })
  );
  self.skipWaiting();
});

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

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome-extension and non-http(s) requests
  if (url.protocol === 'chrome-extension:' || !url.protocol.startsWith('http')) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response for caching
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cache = await caches.open(DATA_CACHE_NAME);

  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful GET requests
    if (request.method === 'GET' && networkResponse.status === 200) {
      const shouldCache = API_CACHE_PATTERNS.some(pattern => 
        request.url.includes(pattern)
      );
      
      if (shouldCache) {
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed - handle based on request method
    if (request.method === 'GET') {
      // For GET requests, try cache
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        // Add header to indicate cached response
        const headers = new Headers(cachedResponse.headers);
        headers.set('X-From-Cache', 'true');
        headers.set('X-Cache-Time', new Date().toISOString());
        
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