import { logger } from './logger';
// Service Worker Registration and Management

interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  sync?: {
    register(tag: string): Promise<void>;
  };
}

export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/),
);

export function register(config?: ServiceWorkerConfig): void {
  if ('serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL ?? '', window.location.href);
    if (publicUrl.origin != window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL ?? ''}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost
        void navigator.serviceWorker.ready.then(() => {
          if (process.env.NODE_ENV === 'development') {
            logger.info('This web app is being served cache-first by a service worker.');
          }
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      if (process.env.NODE_ENV === 'development') {
        logger.info('Back online');
      }
      config?.onOnline?.();

      // Trigger background sync
      void navigator.serviceWorker.ready.then((registration) => {
        if ('sync' in registration) {
          void (registration as ServiceWorkerRegistrationWithSync).sync?.register('sync-planning-data');
        }
      });
    });

    window.addEventListener('offline', () => {
      if (process.env.NODE_ENV === 'development') {
        logger.info('Gone offline');
      }
      config?.onOffline?.();
    });
  }
}

function registerValidSW(swUrl: string, config?: ServiceWorkerConfig): void {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = (): void => {
        const installingWorker = registration.installing;
        if (installingWorker === null) {
          return;
        }
        installingWorker.onstatechange = (): void => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              if (process.env.NODE_ENV === 'development') {
                logger.info('New content is available and will be used when all tabs are closed.');
              }

              // Execute callback
              if (config?.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              if (process.env.NODE_ENV === 'development') {
                logger.info('Content is cached for offline use.');
              }

              // Execute callback
              if (config?.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      logger.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: ServiceWorkerConfig): void {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && !contentType.includes('javascript'))
      ) {
        // No service worker found. Probably a different app. Reload the page.
        void navigator.serviceWorker.ready.then((registration) => {
          void registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      if (process.env.NODE_ENV === 'development') {
        logger.info('No internet connection found. App is running in offline mode.');
      }
    });
}

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker.ready
      .then((registration) => registration.unregister())
      .catch((error) => {
        logger.error((error instanceof Error ? error.message : String(error)));
      });
  }
}

// Helper to check if we're online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Helper to request background sync
export async function requestBackgroundSync(tag: string): Promise<boolean> {
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as ServiceWorkerRegistrationWithSync).sync?.register(tag);
      return true;
    } catch (error) {
      logger.error('Background sync registration failed:', error);
      return false;
    }
  }
  return false;
}

// Helper to cache specific URLs
export async function cacheUrls(urls: string[]): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({
      type: 'CACHE_CURRICULUM',
      urls,
    });
  }
}
