import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { register, unregister, isOnline, requestBackgroundSync, cacheUrls } from '../serviceWorkerRegistration';
import logger from '../logger';

// Mock the logger
vi.mock('../logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('serviceWorkerRegistration', () => {
  const originalEnv = process.env;
  const originalLocation = window.location;
  const originalNavigator = window.navigator;
  const originalFetch = global.fetch;

  // Mock service worker registration
  const mockRegistration = {
    unregister: vi.fn().mockResolvedValue(undefined),
    active: {
      postMessage: vi.fn(),
    },
    installing: null,
    sync: {
      register: vi.fn().mockResolvedValue(undefined),
    },
  };

  // Mock service worker
  const mockServiceWorker = {
    register: vi.fn().mockResolvedValue(mockRegistration),
    ready: Promise.resolve(mockRegistration),
    controller: null,
  };

  const mockFetch = vi.fn();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock environment
    process.env = { ...originalEnv, NODE_ENV: 'production', PUBLIC_URL: '' };
    
    // Mock window.location
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      hostname: 'example.com',
      origin: 'https://example.com',
      href: 'https://example.com',
      reload: vi.fn(),
    } as any;
    
    // Reset the mockServiceWorker ready promise
    mockServiceWorker.ready = Promise.resolve(mockRegistration);
    
    // Mock navigator
    Object.defineProperty(window, 'navigator', {
      configurable: true,
      value: {
        serviceWorker: mockServiceWorker,
        onLine: true,
      },
    });
    
    // Mock fetch
    global.fetch = mockFetch.mockResolvedValue({
      status: 200,
      headers: {
        get: () => 'application/javascript',
      },
    });
    
    // Mock ServiceWorkerRegistration for tests
    (global as any).ServiceWorkerRegistration = {
      prototype: {
        sync: true,
      },
    };
    
    // Reset event listeners
    window.addEventListener = vi.fn((event, handler) => {
      // Store handlers for testing
      (window as any)[`__${event}Handler`] = handler;
    });
    window.removeEventListener = vi.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true
    });
    Object.defineProperty(window, 'navigator', {
      configurable: true,
      value: originalNavigator,
    });
    global.fetch = originalFetch;
    delete (global as any).ServiceWorkerRegistration;
    vi.restoreAllMocks();
  });

  describe('register', () => {
    it('should not register service worker if not supported', () => {
      // Remove service worker support
      Object.defineProperty(window, 'navigator', {
        configurable: true,
        value: {
          onLine: true,
        },
      });

      register();
      
      expect(window.addEventListener).not.toHaveBeenCalled();
    });

    it('should not register if PUBLIC_URL is on different origin', () => {
      process.env.PUBLIC_URL = 'https://different-origin.com';
      
      register();
      
      expect(window.addEventListener).not.toHaveBeenCalled();
    });

    it('should register service worker on production', async () => {
      register();
      
      // Should add load event listener
      expect(window.addEventListener).toHaveBeenCalledWith('load', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
      
      // Simulate load event
      await (window as any).__loadHandler();
      
      // Should call registerValidSW which calls navigator.serviceWorker.register
      await vi.waitFor(() => {
        expect(mockServiceWorker.register).toHaveBeenCalledWith('/service-worker.js');
      });
    });

    it('should check validity on localhost', async () => {
      window.location.hostname = 'localhost';
      process.env.NODE_ENV = 'development';
      
      register();
      
      // Simulate load event
      await (window as any).__loadHandler();
      
      expect(mockFetch).toHaveBeenCalledWith('/service-worker.js', {
        headers: { 'Service-Worker': 'script' },
      });
    });

    it('should handle successful registration with callbacks', async () => {
      const onSuccess = vi.fn();
      const onUpdate = vi.fn();
      
      const mockRegistration = {
        installing: {
          state: 'installed',
          onstatechange: null as any,
        },
        onupdatefound: null as any,
      };
      
      mockServiceWorker.register.mockResolvedValueOnce(mockRegistration);
      
      register({ onSuccess, onUpdate });
      
      // Simulate load event
      await (window as any).__loadHandler();
      
      await vi.waitFor(() => {
        expect(mockServiceWorker.register).toHaveBeenCalled();
      });
      
      // Simulate update found
      if (mockRegistration.onupdatefound) {
        mockRegistration.onupdatefound();
      }
      
      // Simulate state change to installed
      if (mockRegistration.installing?.onstatechange) {
        mockRegistration.installing.onstatechange();
      }
      
      expect(onSuccess).toHaveBeenCalledWith(mockRegistration);
    });

    it('should handle online/offline events', () => {
      process.env.NODE_ENV = 'development';
      const onOnline = vi.fn();
      const onOffline = vi.fn();
      
      register({ onOnline, onOffline });
      
      // Trigger events
      (window as any).__onlineHandler();
      (window as any).__offlineHandler();
      
      expect(onOnline).toHaveBeenCalled();
      expect(onOffline).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Back online');
      expect(logger.info).toHaveBeenCalledWith('Gone offline');
    });

    it('should handle registration errors', async () => {
      const error = new Error('Registration failed');
      mockServiceWorker.register.mockRejectedValueOnce(error);
      
      register();
      
      // Simulate load event
      await (window as any).__loadHandler();
      
      await vi.waitFor(() => {
        expect(logger.error).toHaveBeenCalledWith('Error during service worker registration:', error);
      });
    });

    it('should unregister invalid service worker', async () => {
      window.location.hostname = 'localhost';
      
      // Mock 404 response
      mockFetch.mockResolvedValueOnce({
        status: 404,
        headers: {
          get: () => null,
        },
      });
      
      const mockUnregister = vi.fn().mockResolvedValue(undefined);
      mockServiceWorker.ready = Promise.resolve({
        unregister: mockUnregister,
        active: { postMessage: vi.fn() },
        installing: null,
        sync: { register: vi.fn() },
      });
      
      register();
      
      // Simulate load event
      await (window as any).__loadHandler();
      
      await vi.waitFor(() => {
        expect(mockUnregister).toHaveBeenCalled();
      });
    });

    it('should handle offline mode', async () => {
      window.location.hostname = 'localhost';
      process.env.NODE_ENV = 'development';
      
      // Mock fetch failure
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      register();
      
      // Simulate load event
      await (window as any).__loadHandler();
      
      await vi.waitFor(() => {
        expect(logger.info).toHaveBeenCalledWith('No internet connection found. App is running in offline mode.');
      });
    });
  });

  describe('unregister', () => {
    it('should unregister service worker', async () => {
      await unregister();
      
      expect(mockRegistration.unregister).toHaveBeenCalled();
    });

    it('should handle unregister errors', async () => {
      const error = new Error('Unregister failed');
      mockRegistration.unregister.mockRejectedValueOnce(error);
      
      await unregister();
      
      expect(logger.error).toHaveBeenCalledWith(error.message);
    });

    it('should do nothing if service worker not supported', async () => {
      Object.defineProperty(window, 'navigator', {
        configurable: true,
        value: {},
      });
      
      await unregister();
      
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  describe('isOnline', () => {
    it('should return true when online', () => {
      Object.defineProperty(window.navigator, 'onLine', {
        configurable: true,
        value: true,
      });
      
      expect(isOnline()).toBe(true);
    });

    it('should return false when offline', () => {
      Object.defineProperty(window.navigator, 'onLine', {
        configurable: true,
        value: false,
      });
      
      expect(isOnline()).toBe(false);
    });
  });

  describe('requestBackgroundSync', () => {
    it('should register background sync successfully', async () => {
      const result = await requestBackgroundSync('test-sync');
      
      expect(result).toBe(true);
      expect(mockRegistration.sync.register).toHaveBeenCalledWith('test-sync');
    });

    it('should handle sync registration errors', async () => {
      const error = new Error('Sync failed');
      mockRegistration.sync.register.mockRejectedValueOnce(error);
      
      const result = await requestBackgroundSync('test-sync');
      
      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith('Background sync registration failed:', error);
    });

    it('should return false if sync not supported', async () => {
      // Mock ServiceWorkerRegistration without sync
      (global as any).ServiceWorkerRegistration = {
        prototype: {},
      };
      
      const result = await requestBackgroundSync('test-sync');
      
      expect(result).toBe(false);
    });

    it('should return false if service worker not supported', async () => {
      Object.defineProperty(window, 'navigator', {
        configurable: true,
        value: {},
      });
      
      const result = await requestBackgroundSync('test-sync');
      
      expect(result).toBe(false);
    });
  });

  describe('cacheUrls', () => {
    it('should send cache message to service worker', async () => {
      const urls = ['/api/data1', '/api/data2'];
      await cacheUrls(urls);
      
      expect(mockRegistration.active.postMessage).toHaveBeenCalledWith({
        type: 'CACHE_CURRICULUM',
        urls,
      });
    });

    it('should handle missing active worker gracefully', async () => {
      mockServiceWorker.ready = Promise.resolve({
        unregister: vi.fn(),
        active: null,
        installing: null,
        sync: { register: vi.fn() },
      } as any);
      
      // Should not throw
      await expect(cacheUrls(['/api/data'])).resolves.toBeUndefined();
    });

    it('should do nothing if service worker not supported', async () => {
      Object.defineProperty(window, 'navigator', {
        configurable: true,
        value: {},
      });
      
      await cacheUrls(['/api/data']);
      
      expect(mockRegistration.active.postMessage).not.toHaveBeenCalled();
    });
  });
});